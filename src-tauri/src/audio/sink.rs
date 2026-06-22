#[cfg_attr(test, mockall::automock)]
pub trait AudioSink: Send + 'static {
    fn play(&self);
    fn pause(&self);
    fn set_volume(&self, volume: f32);
    fn is_paused(&self) -> bool;
}

pub struct RodioSink {
    sink: rodio::Sink,
}

impl RodioSink {
    pub fn new(sink: rodio::Sink) -> Self {
        Self { sink }
    }
}

impl AudioSink for RodioSink {
    fn play(&self) {
        self.sink.play();
    }

    fn pause(&self) {
        self.sink.pause();
    }

    fn set_volume(&self, volume: f32) {
        self.sink.set_volume(volume);
    }

    fn is_paused(&self) -> bool {
        self.sink.is_paused()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mock_sink_records_play_calls() {
        let mut mock = MockAudioSink::new();
        mock.expect_play().times(1).return_const(());
        mock.play();
    }

    #[test]
    fn mock_sink_records_pause_calls() {
        let mut mock = MockAudioSink::new();
        mock.expect_pause().times(1).return_const(());
        mock.pause();
    }

    #[test]
    fn mock_sink_records_set_volume_calls() {
        let mut mock = MockAudioSink::new();
        mock.expect_set_volume()
            .with(mockall::predicate::eq(0.5f32))
            .times(1)
            .return_const(());
        mock.set_volume(0.5);
    }

    #[test]
    fn mock_sink_tracks_paused_state() {
        let mut mock = MockAudioSink::new();
        mock.expect_is_paused().times(1).return_const(true);
        assert!(mock.is_paused());
    }
}
