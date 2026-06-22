#[derive(Debug, Clone, PartialEq)]
pub enum AudioCommand {
    SetVolume {
        id: String,
        volume: f32,
        file_path: String,
    },
    SetMasterVolume {
        volume: f32,
    },
    SetGlobalPause {
        paused: bool,
    },
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::mpsc::channel;

    #[test]
    fn set_volume_variant_holds_expected_fields() {
        let cmd = AudioCommand::SetVolume {
            id: "rain".to_string(),
            volume: 0.5,
            file_path: "/audio/rain.wav".to_string(),
        };
        assert_eq!(
            cmd,
            AudioCommand::SetVolume {
                id: "rain".to_string(),
                volume: 0.5,
                file_path: "/audio/rain.wav".to_string(),
            }
        );
    }

    #[test]
    fn set_master_volume_variant_holds_expected_fields() {
        let cmd = AudioCommand::SetMasterVolume { volume: 0.75 };
        assert_eq!(cmd, AudioCommand::SetMasterVolume { volume: 0.75 });
    }

    #[test]
    fn set_global_pause_variant_holds_expected_fields() {
        let cmd = AudioCommand::SetGlobalPause { paused: true };
        assert_eq!(cmd, AudioCommand::SetGlobalPause { paused: true });
    }

    #[test]
    fn command_can_be_sent_through_channel() {
        let (tx, rx) = channel::<AudioCommand>();
        let cmd = AudioCommand::SetMasterVolume { volume: 0.5 };
        tx.send(cmd.clone()).unwrap();
        let received = rx.recv().unwrap();
        assert_eq!(received, cmd);
    }

    #[test]
    fn send_error_when_receiver_dropped() {
        let (tx, rx) = channel::<AudioCommand>();
        drop(rx);
        let result = tx.send(AudioCommand::SetGlobalPause { paused: true });
        assert!(result.is_err());
    }
}
