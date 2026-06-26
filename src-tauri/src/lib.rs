use crate::commands::scan_music_folders;
use crate::state::AppState;
use std::sync::Mutex;
use tauri::Manager;
use crate::database::initialize_database;

mod commands;
mod database;
mod scanner;
mod state;
mod tracks;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![scan_music_folders])
        .setup(|app| {
            let app_data = app.path().app_data_dir()?;

            std::fs::create_dir_all(&app_data)?;

            let db_path = app_data.join("music.db");

            let conn = initialize_database(&db_path).expect("Unable to initialize database");

            app.manage(AppState {
                conn: Mutex::new(conn),
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
