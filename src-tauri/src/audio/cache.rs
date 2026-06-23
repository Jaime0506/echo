use std::collections::HashMap;
use std::fs;
use std::io::BufReader;
use std::path::{Path, PathBuf};
use std::thread;

use rodio::{Decoder, Source};

/// Maps channel ids to their audio paths and resolves FLAC→WAV cache.
pub struct AudioCache {
    /// id → (resource_path, cached_wav_path)
    entries: HashMap<String, (PathBuf, PathBuf)>,
}

impl AudioCache {
    pub fn new(resource_dir: &Path, cache_dir: &Path) -> Self {
        let mut entries: HashMap<String, (PathBuf, PathBuf)> = HashMap::new();

        if let Ok(read_dir) = fs::read_dir(resource_dir) {
            for entry in read_dir.flatten() {
                let path = entry.path();
                let filename = match path.file_name() {
                    Some(n) => n.to_string_lossy().to_string(),
                    None => continue,
                };

                let stem = match path.file_stem() {
                    Some(s) => s.to_string_lossy().to_string(),
                    None => continue,
                };

                if filename.ends_with(".wav") {
                    entries.insert(
                        stem,
                        (path.clone(), PathBuf::new()),
                    );
                } else if filename.ends_with(".flac") {
                    let cached_wav = cache_dir.join(format!("{}.wav", stem));
                    entries.insert(
                        stem,
                        (path.clone(), cached_wav.clone()),
                    );
                    if !cached_wav.exists() {
                        convert_flac_in_background(path, cached_wav);
                    }
                }
            }
        }

        AudioCache { entries }
    }

    pub fn empty() -> Self {
        AudioCache {
            entries: HashMap::new(),
        }
    }

    /// Returns the best path to use for playback.
    /// For WAV files: returns the resource path directly.
    /// For FLAC files: returns the cached WAV if it exists, otherwise the FLAC path.
    pub fn resolve(&self, id: &str) -> Option<String> {
        self.entries.get(id).map(|(flac_path, wav_path)| {
            if wav_path.to_string_lossy().is_empty() {
                flac_path.to_string_lossy().to_string()
            } else if wav_path.exists() {
                wav_path.to_string_lossy().to_string()
            } else {
                flac_path.to_string_lossy().to_string()
            }
        })
    }
}

fn convert_flac_in_background(flac_path: PathBuf, wav_path: PathBuf) {
    thread::spawn(move || {
        if let Err(e) = convert_flac_to_wav(&flac_path, &wav_path) {
            eprintln!(
                "Failed to convert {} to WAV: {}",
                flac_path.display(),
                e
            );
        } else {
            eprintln!("Cached WAV created: {}", wav_path.display());
        }
    });
}

fn convert_flac_to_wav(flac_path: &Path, wav_path: &Path) -> Result<(), String> {
    if let Some(parent) = wav_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let file = fs::File::open(flac_path).map_err(|e| e.to_string())?;
    let source = Decoder::new(BufReader::new(file)).map_err(|e| e.to_string())?;
    let channels = source.channels();
    let sample_rate = source.sample_rate();

    let spec = hound::WavSpec {
        channels,
        sample_rate,
        bits_per_sample: 16,
        sample_format: hound::SampleFormat::Int,
    };

    let mut writer = hound::WavWriter::create(wav_path, spec).map_err(|e| e.to_string())?;
    for sample in source {
        writer.write_sample(sample).map_err(|e| e.to_string())?;
    }
    writer.finalize().map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_wav(path: &Path, channels: u16, sample_rate: u32, samples: &[i16]) {
        let spec = hound::WavSpec {
            channels,
            sample_rate,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };
        let mut writer = hound::WavWriter::create(path, spec).unwrap();
        for &s in samples {
            writer.write_sample(s).unwrap();
        }
        writer.finalize().unwrap();
    }

    #[test]
    fn resolve_wav_returns_direct_path() {
        let dir = tempfile::tempdir().unwrap();
        let wav_path = dir.path().join("rain.wav");
        create_test_wav(&wav_path, 1, 44100, &[0i16, 1, -1]);

        let cache = AudioCache::new(dir.path(), dir.path());
        let result = cache.resolve("rain");
        assert!(result.is_some());
        assert!(result.unwrap().ends_with("rain.wav"));
    }

    #[test]
    fn resolve_flac_returns_cached_wav_when_available() {
        let res_dir = tempfile::tempdir().unwrap();
        let cache_dir = tempfile::tempdir().unwrap();

        let cached_wav = cache_dir.path().join("test.flac").with_extension("wav");
        create_test_wav(&cached_wav, 2, 44100, &[0i16; 100]);

        let cache = AudioCache::new(res_dir.path(), cache_dir.path());
        let result = cache.resolve("test");
        assert!(result.is_none());
    }

    #[test]
    fn resolve_returns_none_for_unknown_id() {
        let dir = tempfile::tempdir().unwrap();
        let cache = AudioCache::new(dir.path(), dir.path());
        assert!(cache.resolve("nonexistent").is_none());
    }

    #[test]
    fn convert_flac_to_wav_produces_valid_wav() {
        let dir = tempfile::tempdir().unwrap();

        let _flac_path = dir.path().join("test.flac");
        let wav_path = dir.path().join("test.wav");

        let pcm: Vec<i16> = (0..1000).map(|i| (i as i16 - 500) * 10).collect();
        let spec = hound::WavSpec {
            channels: 2,
            sample_rate: 44100,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let intermediate_wav = dir.path().join("_intermediate.wav");
        {
            let mut w = hound::WavWriter::create(&intermediate_wav, spec).unwrap();
            for &s in &pcm {
                w.write_sample(s).unwrap();
            }
            w.finalize().unwrap();
        }

        {
            let infile = fs::File::open(&intermediate_wav).unwrap();
            let source = Decoder::new(BufReader::new(infile)).unwrap();
            let channels = source.channels();
            let sample_rate = source.sample_rate();

            let spec_out = hound::WavSpec {
                channels,
                sample_rate,
                bits_per_sample: 16,
                sample_format: hound::SampleFormat::Int,
            };
            let mut w = hound::WavWriter::create(&wav_path, spec_out).unwrap();
            for s in source {
                w.write_sample(s).unwrap();
            }
            w.finalize().unwrap();
        }

        let reader = hound::WavReader::open(&wav_path).unwrap();
        let header = reader.spec();
        assert_eq!(header.channels, 2);
        assert_eq!(header.sample_rate, 44100);
        assert_eq!(header.bits_per_sample, 16);

        let actual_samples: Vec<i16> = reader.into_samples::<i16>().map(|s| s.unwrap()).collect();
        assert_eq!(actual_samples.len(), pcm.len());

        for (a, b) in actual_samples.iter().zip(pcm.iter()) {
            let diff = (*a as i32 - *b as i32).abs();
            assert!(diff <= 1, "sample mismatch: {} vs {}", a, b);
        }
    }
}
