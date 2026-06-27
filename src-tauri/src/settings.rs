use rusqlite::{params, Connection, Result};

pub fn save_music_folders(conn: &Connection, folders: &[String]) -> Result<()> {
    conn.execute(
        "DELETE FROM settings WHERE key = ?1",
        params!["music_folder"],
    )?;

    let mut stmt = conn.prepare("INSERT INTO settings (key, value) VALUES (?1, ?2)")?;

    for folder in folders {
        stmt.execute(params!["music_folder", folder])?;
    }

    Ok(())
}

pub fn load_music_folders(conn: &Connection) -> Result<Vec<String>> {
    let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")?;

    let rows = stmt.query_map(params!["music_folder"], |row| {
        let value: String = row.get(0)?;
        Ok(value)
    })?;

    let mut folders = Vec::new();

    for row in rows {
        folders.push(row?);
    }

    Ok(folders)
}
