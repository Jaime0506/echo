mod audio;
mod commands;

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            // Initialize audio state
            if let Ok(audio_state) = audio::player::AudioState::new() {
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
            commands::audio::set_master_volume
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
