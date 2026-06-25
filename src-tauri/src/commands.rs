#[tauri::command]
pub fn scan_music_folders(folders: Vec<String>) {
    let extensions = ["mp3", "flac", "ogg", "wav", "m4a", "aac"];

    for folder in folders {
        for entry in walkdir::WalkDir::new(folder)
            .into_iter()
            .filter_map(Result::ok)
        {
            let path = entry.path();

            if path.is_file() {
                if let Some(ext) = path.extension() {
                    let ext = ext.to_string_lossy().to_lowercase();

                    if extensions.contains(&ext.as_str()) {
                        println!("{}", path.display());
                    }
                }
            }
        }
    }
}
