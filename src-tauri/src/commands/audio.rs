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
pub async fn set_master_volume(
    volume: f32,
    app_handle: AppHandle,
    state: State<'_, AudioState>,
) -> Result<(), String> {
    state.set_master_volume(volume, &app_handle)
}

#[tauri::command]
pub async fn set_global_pause(
    paused: bool,
    state: State<'_, AudioState>,
) -> Result<(), String> {
    state.set_global_pause(paused)
}

#[cfg(test)]
mod tests {
    use crate::audio::command::AudioCommand;
    use crate::audio::player::AudioState;

    #[test]
    fn command_functions_return_result_string() {
        let state = AudioState::new().unwrap();
        let result = state.tx.send(AudioCommand::SetMasterVolume { volume: 0.5 });
        assert!(result.is_ok());
    }

    #[test]
    fn set_channel_volume_delegates_to_audio_state() {
        let state = AudioState::new().unwrap();
        let result = state.tx.send(AudioCommand::SetVolume {
            id: "rain".into(),
            volume: 0.5,
            file_path: "/tmp/test.wav".into(),
        });
        assert!(result.is_ok());
    }

    #[test]
    fn set_master_volume_delegates_to_audio_state() {
        let state = AudioState::new().unwrap();
        let result = state.tx.send(AudioCommand::SetMasterVolume { volume: 0.8 });
        assert!(result.is_ok());
    }

    #[test]
    fn set_global_pause_delegates_to_audio_state() {
        let state = AudioState::new().unwrap();
        let result = state.tx.send(AudioCommand::SetGlobalPause { paused: true });
        assert!(result.is_ok());
    }
}
