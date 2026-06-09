use crate::audio::player::AudioState;
use tauri::{AppHandle, State};

#[tauri::command]
pub async fn set_channel_volume(
    id: String,
    volume: f32,
    app_handle: AppHandle,
    state: State<'_, AudioState>,
) -> Result<(), String> {
    state.set_volume(&id, volume, &app_handle)
}

#[tauri::command]
pub async fn set_master_volume(volume: f32, app_handle: AppHandle, state: State<'_, AudioState>) -> Result<(), String> {
    state.set_master_volume(volume, &app_handle)
}