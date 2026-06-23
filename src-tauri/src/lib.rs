pub mod audio;
mod commands;

use std::path::PathBuf;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn audio_cache_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path()
        .app_cache_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("audio")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let resource_dir = app.path().resource_dir().unwrap_or_else(|_| PathBuf::from("."));
            let cache_dir = audio_cache_dir(app.handle());

            let cache = audio::cache::AudioCache::new(&resource_dir, &cache_dir);

            // Initialize audio state with cache
            if let Ok(audio_state) = audio::player::AudioState::with_cache(cache) {
                app.manage(audio_state);
            } else {
                eprintln!("Failed to initialize audio state");
            }

            #[cfg(target_os = "windows")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.set_decorations(false).unwrap();
                }
            }
            Ok(())
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::audio::set_channel_volume,
            commands::audio::set_master_volume,
            commands::audio::set_global_pause
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
