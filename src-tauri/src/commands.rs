use crate::{scanner, state::AppState, tracks};
use std::time::UNIX_EPOCH;
use tauri::State;
use walkdir::WalkDir;

#[tauri::command]
pub fn scan_music_folders(folders: Vec<String>, state: State<AppState>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    let extensions = ["mp3", "flac", "ogg", "wav", "m4a", "aac"];

    for folder in folders {
        for entry in WalkDir::new(folder).into_iter().filter_map(Result::ok) {
            let path = entry.path();

            if !path.is_file() {
                continue;
            }

            let Some(ext) = path.extension() else {
                continue;
            };

            let ext = ext.to_string_lossy().to_lowercase();

            if !extensions.contains(&ext.as_str()) {
                continue;
            }

            let metadata = std::fs::metadata(path).map_err(|e| e.to_string())?;

            let filename = path.file_name().unwrap().to_string_lossy().to_string();

            let filesize = metadata.len() as i64;

            let modified = metadata
                .modified()
                .map_err(|e| e.to_string())?
                .duration_since(UNIX_EPOCH)
                .map_err(|e| e.to_string())?
                .as_secs() as i64;

            tracks::insert(
                &conn,
                &path.to_string_lossy(),
                &filename,
                filesize,
                modified,
            )
            .map_err(|e| e.to_string())?;
        }
    }

    scanner::scan_metadata(&conn).map_err(|e| e.to_string())?;

    Ok(())
}
