use echo_lib::audio::command::AudioCommand;
use echo_lib::audio::player::{process_command, AudioEngineState, get_file_for_id};
use echo_lib::audio::sink::AudioSink;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
struct SpySink {
    play_count: Arc<Mutex<u32>>,
    pause_count: Arc<Mutex<u32>>,
    last_volume: Arc<Mutex<f32>>,
    paused: Arc<Mutex<bool>>,
}

impl SpySink {
    fn new() -> Self {
        Self {
            play_count: Arc::new(Mutex::new(0)),
            pause_count: Arc::new(Mutex::new(0)),
            last_volume: Arc::new(Mutex::new(0.0)),
            paused: Arc::new(Mutex::new(false)),
        }
    }
}

impl AudioSink for SpySink {
    fn play(&self) {
        *self.play_count.lock().unwrap() += 1;
        *self.paused.lock().unwrap() = false;
    }
    fn pause(&self) {
        *self.pause_count.lock().unwrap() += 1;
        *self.paused.lock().unwrap() = true;
    }
    fn set_volume(&self, volume: f32) {
        *self.last_volume.lock().unwrap() = volume;
    }
    fn is_paused(&self) -> bool {
        *self.paused.lock().unwrap()
    }
}

fn make_factory(sink: SpySink) -> impl FnMut(&str) -> Result<Box<dyn AudioSink>, String> {
    let mut used = false;
    move |_fp| {
        if !used {
            used = true;
            Ok(Box::new(sink.clone()))
        } else {
            Ok(Box::new(SpySink::new()))
        }
    }
}

#[test]
fn integration_set_volume_creates_and_plays_sink() {
    let spy = SpySink::new();
    let mut state = AudioEngineState {
        sinks: HashMap::new(),
        master_volume: 1.0,
        global_paused: false,
    };

    process_command(
        &AudioCommand::SetVolume {
            id: "test".into(),
            volume: 0.7,
            file_path: "/tmp/test.wav".into(),
        },
        &mut state,
        &mut make_factory(spy.clone()),
    );

    assert_eq!(state.sinks.len(), 1);
    assert!((state.sinks.get("test").unwrap().1 - 0.7).abs() < f32::EPSILON);
    assert_eq!(*spy.play_count.lock().unwrap(), 1);
    assert_eq!(*spy.last_volume.lock().unwrap(), 0.7);
}

#[test]
fn integration_set_volume_zero_pauses_sink() {
    let spy = SpySink::new();
    let mut state = AudioEngineState {
        sinks: {
            let mut m = HashMap::new();
            m.insert("test".into(), (Box::new(spy.clone()) as Box<dyn AudioSink>, 0.5));
            m
        },
        master_volume: 1.0,
        global_paused: false,
    };

    process_command(
        &AudioCommand::SetVolume {
            id: "test".into(),
            volume: 0.0,
            file_path: "/tmp/test.wav".into(),
        },
        &mut state,
        &mut make_factory(SpySink::new()),
    );

    assert_eq!(*spy.pause_count.lock().unwrap(), 1);
    assert_eq!(state.sinks.get("test").unwrap().1, 0.0);
}

#[test]
fn integration_master_volume_scales_all_channels() {
    let rain_spy = SpySink::new();
    let wind_spy = SpySink::new();
    let mut state = AudioEngineState {
        sinks: {
            let mut m = HashMap::new();
            m.insert("rain".into(), (Box::new(rain_spy.clone()) as Box<dyn AudioSink>, 0.8));
            m.insert("wind".into(), (Box::new(wind_spy.clone()) as Box<dyn AudioSink>, 0.4));
            m
        },
        master_volume: 1.0,
        global_paused: false,
    };

    process_command(
        &AudioCommand::SetMasterVolume { volume: 0.5 },
        &mut state,
        &mut make_factory(SpySink::new()),
    );

    assert_eq!(state.master_volume, 0.5);
    assert_eq!(*rain_spy.last_volume.lock().unwrap(), 0.4);
    assert_eq!(*wind_spy.last_volume.lock().unwrap(), 0.2);
}

#[test]
fn integration_global_pause_resume_cycle() {
    let spy = SpySink::new();
    let mut state = AudioEngineState {
        sinks: {
            let mut m = HashMap::new();
            m.insert("rain".into(), (Box::new(spy.clone()) as Box<dyn AudioSink>, 0.5));
            m
        },
        master_volume: 1.0,
        global_paused: false,
    };

    process_command(
        &AudioCommand::SetGlobalPause { paused: true },
        &mut state,
        &mut make_factory(SpySink::new()),
    );
    assert!(state.global_paused);
    assert_eq!(*spy.pause_count.lock().unwrap(), 1);

    process_command(
        &AudioCommand::SetGlobalPause { paused: false },
        &mut state,
        &mut make_factory(SpySink::new()),
    );
    assert!(!state.global_paused);
    assert_eq!(*spy.play_count.lock().unwrap(), 1);
}

#[test]
fn integration_get_file_for_id_mappings() {
    let rain = get_file_for_id("rain");
    assert!(rain.contains("212799__ayton__rain-loop-ontario-loop.wav"));

    let wind = get_file_for_id("wind");
    assert!(wind.contains("151770__gnrja__storm-winds-loop.wav"));

    let unknown = get_file_for_id("custom_sound");
    assert_eq!(unknown, "resources/custom_sound.wav");
}

#[test]
fn integration_audio_state_creates_channel() {
    let state = echo_lib::audio::player::AudioState::new();
    assert!(state.is_ok());
    let state = state.unwrap();
    let result = state.tx.send(AudioCommand::SetMasterVolume { volume: 0.5 });
    assert!(result.is_ok());
}
