use rusqlite::{Connection, Result};
use crate::models::Track;

pub fn insert(
    conn: &Connection,
    path: &str,
    filename: &str,
    filesize: i64,
    modified: i64,
) -> Result<()> {
    conn.execute(
        "
        INSERT OR IGNORE INTO tracks
        (
            path,
            filename,
            filesize,
            modified
        )
        VALUES (?, ?, ?, ?)
        ",
        (path, filename, filesize, modified),
    )?;

    Ok(())
}

pub fn pending_metadata(conn: &Connection) -> Result<Vec<(i64, String)>> {
    let mut stmt = conn.prepare(
        "
            SELECT id, path
            FROM tracks
            WHERE metadata_scanned = 0
        ",
    )?;

    let rows = stmt.query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn update_metadata(
    conn: &Connection,
    id: i64,
    title: Option<String>,
    artist: Option<String>,
    album: Option<String>,
    duration: Option<i64>,
) -> Result<()> {
    conn.execute(
        "
        UPDATE tracks
        SET
            title = ?1,
            artist = ?2,
            album = ?3,
            duration = ?4,
            metadata_scanned = 1
        WHERE id = ?5
        ",
        (title, artist, album, duration, id),
    )?;

    Ok(())
}

pub fn get_all(conn: &Connection) -> Result<Vec<Track>> {
    let mut stmt = conn.prepare(
        "
            SELECT
                id,
                title,
                artist,
                album,
                filename
            FROM tracks
            ORDER BY filename ASC
        ",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Track {
            id: row.get(0)?,
            title: row.get(1)?,
            artist: row.get(2)?,
            album: row.get(3)?,
            filename: row.get(4)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}
