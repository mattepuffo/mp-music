// #[derive(serde::Deserialize)]
// pub struct Settings {
//     pub music_folders: Vec<String>,
// }

#[derive(serde::Serialize)]
pub struct Track {
    pub id: i64,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub filename: String,
    pub modified: i64,
}
