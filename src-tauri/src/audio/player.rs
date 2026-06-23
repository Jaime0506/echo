use crate::audio::cache::AudioCache;
use crate::audio::command::AudioCommand;
use crate::audio::sink::{AudioSink, RodioSink};
use rodio::buffer::SamplesBuffer;
use rodio::{Decoder, OutputStream, Sink, Source};
use std::collections::HashMap;
use std::fs::File;
use std::io::BufReader;
use std::sync::mpsc::{channel, Sender};
use std::thread;
use tauri::{AppHandle, Manager};

pub struct AudioState {
    pub tx: Sender<AudioCommand>,
    pub cache: AudioCache,
}

pub struct AudioEngineState {
    pub sinks: HashMap<String, (Box<dyn AudioSink>, f32)>,
    pub master_volume: f32,
    pub global_paused: bool,
}

type SinkFactory = dyn FnMut(&str) -> Result<Box<dyn AudioSink>, String>;

pub fn process_command(
    cmd: &AudioCommand,
    state: &mut AudioEngineState,
    sink_factory: &mut SinkFactory,
) {
    match cmd {
        AudioCommand::SetVolume {
            id,
            volume,
            file_path,
        } => {
            if *volume > 0.0 {
                if let Some((sink, chan_vol)) = state.sinks.get_mut(id) {
                    *chan_vol = *volume;
                    sink.set_volume(*volume * state.master_volume);
                    if !state.global_paused && sink.is_paused() {
                        sink.play();
                    } else if state.global_paused && !sink.is_paused() {
                        sink.pause();
                    }
                } else if let Ok(new_sink) = sink_factory(file_path) {
                    new_sink.set_volume(*volume * state.master_volume);
                    if !state.global_paused {
                        new_sink.play();
                    } else {
                        new_sink.pause();
                    }
                    state.sinks.insert(id.clone(), (new_sink, *volume));
                }
            } else if let Some((sink, chan_vol)) = state.sinks.get_mut(id) {
                *chan_vol = *volume;
                sink.pause();
            }
        }
        AudioCommand::SetMasterVolume { volume } => {
            state.master_volume = *volume;
            for (sink, chan_vol) in state.sinks.values() {
                sink.set_volume(*chan_vol * state.master_volume);
            }
        }
        AudioCommand::SetGlobalPause { paused } => {
            state.global_paused = *paused;
            for (sink, chan_vol) in state.sinks.values() {
                if state.global_paused {
                    sink.pause();
                } else if *chan_vol > 0.0 {
                    sink.play();
                }
            }
        }
    }
}

pub fn get_file_for_id(id: &str) -> String {
    match id {
        "rain" => "resources/212799__ayton__rain-loop-ontario-loop.wav".to_string(),
        "wind" => "resources/151770__gnrja__storm-winds-loop.wav".to_string(),
        "nature" => "resources/634511__resaural__spring-birds-woodpeckers-loop-final.flac".to_string(),
        _ => format!("resources/{}.wav", id),
    }
}

impl AudioState {
    pub fn with_cache(cache: AudioCache) -> Result<Self, String> {
        let (tx, rx) = channel::<AudioCommand>();

        thread::spawn(move || {
            let (_stream, stream_handle) = match OutputStream::try_default() {
                Ok(res) => res,
                Err(e) => {
                    eprintln!("Failed to get output stream: {}", e);
                    return;
                }
            };

            let mut engine_state = AudioEngineState {
                sinks: HashMap::new(),
                master_volume: 1.0,
                global_paused: false,
            };

            let mut rodio_factory = move
                |file_path: &str| -> Result<Box<dyn AudioSink>, String> {
                    let sink =
                        Sink::try_new(&stream_handle).map_err(|e| e.to_string())?;
                    let file =
                        File::open(file_path).map_err(|e| e.to_string())?;

                    if file_path.ends_with(".wav") {
                        let source = Decoder::new(BufReader::new(file))
                            .map_err(|e| e.to_string())?;
                        sink.append(source.repeat_infinite());
                    } else {
                        let source = Decoder::new(BufReader::new(file))
                            .map_err(|e| e.to_string())?;
                        let channels = source.channels();
                        let sample_rate = source.sample_rate();
                        let samples: Vec<f32> = source.convert_samples().collect();
                        sink.append(
                            SamplesBuffer::new(channels, sample_rate, samples)
                                .repeat_infinite(),
                        );
                    }
                    Ok(Box::new(RodioSink::new(sink)))
                };

            for cmd in rx {
                process_command(&cmd, &mut engine_state, &mut rodio_factory);
            }
        });

        Ok(Self { tx, cache })
    }

    pub fn new() -> Result<Self, String> {
        Self::with_cache(AudioCache::empty())
    }

    pub fn set_volume(
        &self,
        id: &str,
        volume: f32,
        app_handle: &AppHandle,
    ) -> Result<(), String> {
        let file_path = self.cache.resolve(id).unwrap_or_else(|| {
            let resource_dir = app_handle
                .path()
                .resource_dir()
                .map_err(|e| e.to_string())
                .unwrap_or_default();
            resource_dir
                .join(get_file_for_id(id))
                .to_string_lossy()
                .to_string()
        });

        self.tx
            .send(AudioCommand::SetVolume {
                id: id.to_string(),
                volume,
                file_path,
            })
            .map_err(|e| e.to_string())
    }

    pub fn set_master_volume(
        &self,
        volume: f32,
        _app_handle: &AppHandle,
    ) -> Result<(), String> {
        self.tx
            .send(AudioCommand::SetMasterVolume { volume })
            .map_err(|e| e.to_string())
    }

    pub fn set_global_pause(&self, paused: bool) -> Result<(), String> {
        self.tx
            .send(AudioCommand::SetGlobalPause { paused })
            .map_err(|e| e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::audio::sink::MockAudioSink;
    use mockall::predicate::*;

    fn empty_state() -> AudioEngineState {
        AudioEngineState {
            sinks: HashMap::new(),
            master_volume: 1.0,
            global_paused: false,
        }
    }

    // --- SetVolume ---

    #[test]
    fn set_volume_above_zero_creates_new_sink() {
        let mut state = empty_state();

        process_command(
            &AudioCommand::SetVolume {
                id: "rain".into(),
                volume: 0.5,
                file_path: "/path/file.wav".into(),
            },
            &mut state,
            &mut |_fp| {
                let mut mock = MockAudioSink::new();
                mock.expect_set_volume()
                    .with(eq(0.5f32))
                    .times(1)
                    .return_const(());
                mock.expect_play().times(1).return_const(());
                Ok(Box::new(mock))
            },
        );

        assert_eq!(state.sinks.len(), 1);
        assert_eq!(state.sinks.get("rain").unwrap().1, 0.5);
    }

    #[test]
    fn set_volume_updates_existing_sink_volume() {
        let mut mock = MockAudioSink::new();
        mock.expect_is_paused().return_const(false);
        mock.expect_set_volume()
            .with(eq(0.8f32))
            .times(1)
            .return_const(());

        let mut state = AudioEngineState {
            sinks: {
                let mut m = HashMap::new();
                m.insert("rain".into(), (Box::new(mock) as Box<dyn AudioSink>, 0.3));
                m
            },
            master_volume: 1.0,
            global_paused: false,
        };

        process_command(
            &AudioCommand::SetVolume {
                id: "rain".into(),
                volume: 0.8,
                file_path: "/path/file.wav".into(),
            },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );

        assert_eq!(state.sinks.get("rain").unwrap().1, 0.8);
    }

    #[test]
    fn set_volume_zero_pauses_existing_sink() {
        let mut mock = MockAudioSink::new();
        mock.expect_pause().times(1).return_const(());

        let mut state = AudioEngineState {
            sinks: {
                let mut m = HashMap::new();
                m.insert("rain".into(), (Box::new(mock) as Box<dyn AudioSink>, 0.5));
                m
            },
            master_volume: 1.0,
            global_paused: false,
        };

        process_command(
            &AudioCommand::SetVolume {
                id: "rain".into(),
                volume: 0.0,
                file_path: "/path/file.wav".into(),
            },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );

        assert_eq!(state.sinks.get("rain").unwrap().1, 0.0);
    }

    #[test]
    fn set_volume_resumes_paused_sink_when_not_globally_paused() {
        let mut mock = MockAudioSink::new();
        mock.expect_is_paused().return_const(true);
        mock.expect_set_volume().return_const(());
        mock.expect_play().times(1).return_const(());

        let mut state = AudioEngineState {
            sinks: {
                let mut m = HashMap::new();
                m.insert("rain".into(), (Box::new(mock) as Box<dyn AudioSink>, 0.0));
                m
            },
            master_volume: 1.0,
            global_paused: false,
        };

        process_command(
            &AudioCommand::SetVolume {
                id: "rain".into(),
                volume: 0.5,
                file_path: "/path/file.wav".into(),
            },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );
    }

    #[test]
    fn set_volume_sink_stays_paused_when_globally_paused() {
        let mut mock = MockAudioSink::new();
        mock.expect_is_paused().return_const(true);
        mock.expect_set_volume().return_const(());

        let mut state = AudioEngineState {
            sinks: {
                let mut m = HashMap::new();
                m.insert("rain".into(), (Box::new(mock) as Box<dyn AudioSink>, 0.0));
                m
            },
            master_volume: 1.0,
            global_paused: true,
        };

        process_command(
            &AudioCommand::SetVolume {
                id: "rain".into(),
                volume: 0.5,
                file_path: "/path/file.wav".into(),
            },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );
    }

    #[test]
    fn set_volume_multiplies_by_master_volume() {
        let mut state = AudioEngineState {
            sinks: HashMap::new(),
            master_volume: 0.5,
            global_paused: false,
        };

        process_command(
            &AudioCommand::SetVolume {
                id: "rain".into(),
                volume: 0.5,
                file_path: "/path/file.wav".into(),
            },
            &mut state,
            &mut |_fp| {
                let mut mock = MockAudioSink::new();
                mock.expect_set_volume()
                    .with(eq(0.25f32))
                    .times(1)
                    .return_const(());
                mock.expect_play().times(1).return_const(());
                Ok(Box::new(mock))
            },
        );
    }

    // --- SetMasterVolume ---

    #[test]
    fn master_volume_updates_all_sinks() {
        let mut mock1 = MockAudioSink::new();
        mock1.expect_set_volume()
            .with(eq(0.4f32))
            .times(1)
            .return_const(());
        let mut mock2 = MockAudioSink::new();
        mock2.expect_set_volume()
            .with(eq(0.2f32))
            .times(1)
            .return_const(());

        let mut state = AudioEngineState {
            sinks: {
                let mut m = HashMap::new();
                m.insert("rain".into(), (Box::new(mock1) as Box<dyn AudioSink>, 0.8));
                m.insert("wind".into(), (Box::new(mock2) as Box<dyn AudioSink>, 0.4));
                m
            },
            master_volume: 1.0,
            global_paused: false,
        };

        process_command(
            &AudioCommand::SetMasterVolume { volume: 0.5 },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );

        assert_eq!(state.master_volume, 0.5);
    }

    #[test]
    fn master_volume_zero_mutes_all() {
        let mut mock = MockAudioSink::new();
        mock.expect_set_volume()
            .with(eq(0.0f32))
            .times(1)
            .return_const(());

        let mut state = AudioEngineState {
            sinks: {
                let mut m = HashMap::new();
                m.insert("rain".into(), (Box::new(mock) as Box<dyn AudioSink>, 0.8));
                m
            },
            master_volume: 1.0,
            global_paused: false,
        };

        process_command(
            &AudioCommand::SetMasterVolume { volume: 0.0 },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );

        assert_eq!(state.master_volume, 0.0);
    }

    #[test]
    fn master_volume_with_empty_channels_does_not_error() {
        let mut state = empty_state();
        process_command(
            &AudioCommand::SetMasterVolume { volume: 0.5 },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );
        assert_eq!(state.master_volume, 0.5);
    }

    // --- SetGlobalPause ---

    #[test]
    fn global_pause_true_pauses_active_sinks() {
        let mut mock = MockAudioSink::new();
        mock.expect_pause().times(1).return_const(());

        let mut state = AudioEngineState {
            sinks: {
                let mut m = HashMap::new();
                m.insert("rain".into(), (Box::new(mock) as Box<dyn AudioSink>, 0.5));
                m
            },
            master_volume: 1.0,
            global_paused: false,
        };

        process_command(
            &AudioCommand::SetGlobalPause { paused: true },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );

        assert!(state.global_paused);
    }

    #[test]
    fn global_pause_false_resumes_active_sinks() {
        let mut mock = MockAudioSink::new();
        mock.expect_play().times(1).return_const(());

        let mut state = AudioEngineState {
            sinks: {
                let mut m = HashMap::new();
                m.insert("rain".into(), (Box::new(mock) as Box<dyn AudioSink>, 0.5));
                m
            },
            master_volume: 1.0,
            global_paused: true,
        };

        process_command(
            &AudioCommand::SetGlobalPause { paused: false },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );

        assert!(!state.global_paused);
    }

    #[test]
    fn global_pause_false_skips_muted_sinks() {
        let mut mock = MockAudioSink::new();
        mock.expect_play().times(0).return_const(());

        let mut state = AudioEngineState {
            sinks: {
                let mut m = HashMap::new();
                m.insert("rain".into(), (Box::new(mock) as Box<dyn AudioSink>, 0.0));
                m
            },
            master_volume: 1.0,
            global_paused: true,
        };

        process_command(
            &AudioCommand::SetGlobalPause { paused: false },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );
    }

    #[test]
    fn multiple_commands_processed_in_order() {
        let mut state = empty_state();

        let mut persistent_mock = Some({
            let mut m = MockAudioSink::new();
            m.expect_set_volume().return_const(());
            m.expect_play().return_const(());
            m.expect_pause().return_const(());
            m.expect_is_paused().return_const(false);
            m
        });

        process_command(
            &AudioCommand::SetVolume {
                id: "rain".into(),
                volume: 0.5,
                file_path: "/p/file.wav".into(),
            },
            &mut state,
            &mut move |_fp| Ok(Box::new(persistent_mock.take().unwrap())),
        );
        assert_eq!(state.sinks.len(), 1);
        assert_eq!(state.sinks.get("rain").unwrap().1, 0.5);

        process_command(
            &AudioCommand::SetMasterVolume { volume: 0.4 },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );
        assert_eq!(state.master_volume, 0.4);

        process_command(
            &AudioCommand::SetVolume {
                id: "rain".into(),
                volume: 0.0,
                file_path: "/p/file.wav".into(),
            },
            &mut state,
            &mut |_fp| Ok(Box::new(MockAudioSink::new())),
        );
        assert_eq!(state.sinks.get("rain").unwrap().1, 0.0);
    }

    // --- AudioState ---

    #[test]
    fn audio_state_new_creates_sender() {
        let state = AudioState::new().unwrap();
        let result = state.tx.send(AudioCommand::SetMasterVolume { volume: 0.5 });
        assert!(result.is_ok());
    }

    #[test]
    fn set_volume_sends_command() {
        let state = AudioState::new().unwrap();
        let result = state.tx.send(AudioCommand::SetMasterVolume { volume: 0.5 });
        assert!(result.is_ok());
    }

    // --- get_file_for_id ---

    #[test]
    fn get_file_for_id_rain() {
        let path = get_file_for_id("rain");
        assert!(path.ends_with("212799__ayton__rain-loop-ontario-loop.wav"));
        assert!(path.starts_with("resources/"));
    }

    #[test]
    fn get_file_for_id_wind() {
        let path = get_file_for_id("wind");
        assert!(path.ends_with("151770__gnrja__storm-winds-loop.wav"));
        assert!(path.starts_with("resources/"));
    }

    #[test]
    fn get_file_for_id_unknown_id_uses_fallback() {
        let path = get_file_for_id("custom");
        assert_eq!(path, "resources/custom.wav");
    }
}
