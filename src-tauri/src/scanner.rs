use crate::tracks::{pending_metadata, update_metadata};
use lofty::prelude::*;
use lofty::probe::Probe;
use rusqlite::Connection;

pub fn scan_metadata(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    let tracks = pending_metadata(conn)?;

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

        update_metadata(conn, id, title, artist, album, duration)?;
    }

    Ok(())
}
