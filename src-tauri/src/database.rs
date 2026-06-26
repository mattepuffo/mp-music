use crate::tracks;
use lofty::file::{AudioFile, TaggedFileExt};
use lofty::prelude::Accessor;
use lofty::probe::Probe;
use rusqlite::{Connection, Result};
use std::path::Path;

pub fn initialize_database(db_path: &Path) -> Result<Connection> {
    let conn = Connection::open(db_path)?;

    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL UNIQUE,
            filename TEXT NOT NULL,
            metadata_scanned INTEGER NOT NULL DEFAULT 0,
            title TEXT,
            artist TEXT,
            album TEXT,
            album_artist TEXT,
            genre TEXT,
            track INTEGER,
            disc INTEGER,
            year INTEGER,
            duration INTEGER,
            bitrate INTEGER,
            samplerate INTEGER,
            filesize INTEGER,
            modified INTEGER,
            cover_hash TEXT
        );

        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER NOT NULL
        );
        "#,
    )?;

    Ok(conn)
}

pub fn scan_metadata(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    let tracks = tracks::pending_metadata(conn)?;

    println!("Scanning {} tracks...", tracks.len());

    for (id, path) in tracks {
        println!("Reading {}", path);

        let tagged_file = match Probe::open(&path)?.read() {
            Ok(file) => file,
            Err(err) => {
                eprintln!("Cannot read {}: {}", path, err);
                continue;
            }
        };

        let tag = tagged_file.primary_tag();

        let title = tag.and_then(|t| t.title()).map(|s| s.to_string());

        let artist = tag.and_then(|t| t.artist()).map(|s| s.to_string());

        let album = tag.and_then(|t| t.album()).map(|s| s.to_string());

        let duration = Some(tagged_file.properties().duration().as_secs() as i64);

        tracks::update_metadata(conn, id, title, artist, album, duration)?;
    }

    Ok(())
}
