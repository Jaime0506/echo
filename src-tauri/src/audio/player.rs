use rodio::{Decoder, OutputStream, Sink, Source};
use std::collections::HashMap;
use std::fs::File;
use std::io::BufReader;
use std::sync::mpsc::{channel, Sender};
use std::thread;
use tauri::{AppHandle, Manager};

pub enum AudioCommand {
    SetVolume { id: String, volume: f32, file_path: String },
    SetMasterVolume { volume: f32 },
}

pub struct AudioState {
    pub tx: Sender<AudioCommand>,
}

impl AudioState {
    pub fn new() -> Result<Self, String> {
        let (tx, rx) = channel::<AudioCommand>();

        thread::spawn(move || {
            let (_stream, stream_handle) = match OutputStream::try_default() {
                Ok(res) => res,
                Err(e) => {
                    eprintln!("Failed to get output stream: {}", e);
                    return;
                }
            };
            
            // Store the sink and its individual channel volume
            let mut sinks: HashMap<String, (Sink, f32)> = HashMap::new();
            let mut master_volume: f32 = 1.0;

            for cmd in rx {
                match cmd {
                    AudioCommand::SetVolume { id, volume, file_path } => {
                        if volume > 0.0 {
                            if let Some((sink, chan_vol)) = sinks.get_mut(&id) {
                                *chan_vol = volume;
                                sink.set_volume(volume * master_volume);
                                if sink.is_paused() {
                                    sink.play();
                                }
                            } else {
                                if let Ok(sink) = Sink::try_new(&stream_handle) {
                                    if let Ok(file) = File::open(&file_path) {
                                        if let Ok(source) = Decoder::new(BufReader::new(file)) {
                                            sink.append(source.repeat_infinite());
                                            sink.set_volume(volume * master_volume);
                                            sink.play();
                                            sinks.insert(id, (sink, volume));
                                        }
                                    }
                                }
                            }
                        } else {
                            if let Some((sink, chan_vol)) = sinks.get_mut(&id) {
                                *chan_vol = volume;
                                sink.pause();
                            }
                        }
                    }
                    AudioCommand::SetMasterVolume { volume } => {
                        master_volume = volume;
                        // Update all active sinks with the new master volume scaled
                        for (sink, chan_vol) in sinks.values() {
                            sink.set_volume(*chan_vol * master_volume);
                        }
                    }
                }
            }
        });

        Ok(Self { tx })
    }

    pub fn set_volume(&self, id: &str, volume: f32, app_handle: &AppHandle) -> Result<(), String> {
        let resource_path = app_handle
            .path()
            .resource_dir()
            .map_err(|e| e.to_string())?
            .join(self.get_file_for_id(id))
            .to_string_lossy()
            .to_string();

        self.tx
            .send(AudioCommand::SetVolume {
                id: id.to_string(),
                volume,
                file_path: resource_path,
            })
            .map_err(|e| e.to_string())
    }

    pub fn set_master_volume(&self, volume: f32, _app_handle: &AppHandle) -> Result<(), String> {
        self.tx
            .send(AudioCommand::SetMasterVolume { volume })
            .map_err(|e| e.to_string())
    }

    fn get_file_for_id(&self, id: &str) -> String {
        match id {
            "rain" => "resources/212799__ayton__rain-loop-ontario-loop.wav".to_string(),
            _ => format!("resources/{}.wav", id),
        }
    }
}
