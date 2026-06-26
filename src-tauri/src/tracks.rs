use rusqlite::{Connection, Result};

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
            title=?,
            artist=?,
            album=?,
            duration=?,
            metadata_scanned=1
        WHERE id=?
        ",
        (title, artist, album, duration, id),
    )?;

    Ok(())
}
