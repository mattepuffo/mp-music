use rusqlite::{Connection, Result};
use std::path::Path;

pub fn initialize_database(db_path: &Path) -> Result<Connection> {
    let conn = Connection::open(db_path)?;

    conn.execute_batch(
        r#"
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                value TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS settings_key_index ON settings (key);

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
