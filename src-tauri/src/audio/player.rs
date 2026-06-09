use rodio::{Decoder, OutputStream, Sink, Source};
use std::collections::HashMap;
use std::fs::File;
use std::io::BufReader;
use std::sync::mpsc::{channel, Sender};
use std::thread;
use tauri::{AppHandle, Manager};

pub enum AudioCommand {
    SetVolume { id: String, volume: f32, file_path: String },
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
            let mut sinks: HashMap<String, Sink> = HashMap::new();

            for cmd in rx {
                match cmd {
                    AudioCommand::SetVolume { id, volume, file_path } => {
                        if volume > 0.0 {
                            if let Some(sink) = sinks.get(&id) {
                                sink.set_volume(volume);
                                if sink.is_paused() {
                                    sink.play();
                                }
                            } else {
                                if let Ok(sink) = Sink::try_new(&stream_handle) {
                                    if let Ok(file) = File::open(&file_path) {
                                        if let Ok(source) = Decoder::new(BufReader::new(file)) {
                                            sink.append(source.repeat_infinite());
                                            sink.set_volume(volume);
                                            sink.play();
                                            sinks.insert(id, sink);
                                        }
                                    }
                                }
                            }
                        } else {
                            if let Some(sink) = sinks.get(&id) {
                                sink.pause();
                            }
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

    fn get_file_for_id(&self, id: &str) -> String {
        match id {
            "rain" => "resources/212799__ayton__rain-loop-ontario-loop.wav".to_string(),
            _ => format!("resources/{}.wav", id),
        }
    }
}
