import seedrandom from 'seedrandom';

const SAMPLE_RATE = 22050;
const DURATION_SECONDS = 5; 
const MAX_AMPLITUDE = 32760;

const NOTE_FREQUENCIES = {
  C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0, B: 493.88
};

const majorIntervals = [0, 2, 4, 5, 7, 9, 11, 12];
const minorIntervals = [0, 2, 3, 5, 7, 8, 10, 12];

const noteToFrequency = (root, semitoneOffset) => {
  return (NOTE_FREQUENCIES[root] || 261.63) * Math.pow(2, semitoneOffset / 12);
};

const envelope = (progress) => {
  if (progress < 0.05) return progress / 0.05;
  if (progress > 0.85) return Math.max(0, (1 - progress) / 0.15);
  return 1;
};

const waveform = (phase, type) => {
  if (type === 'square') return phase % (2 * Math.PI) < Math.PI ? 0.6 : -0.6;
  if (type === 'sawtooth') return 2 * ((phase / (2 * Math.PI)) - Math.floor((phase / (2 * Math.PI)) + 0.5));
  if (type === 'triangle') return 2 * Math.abs(2 * ((phase / (2 * Math.PI)) - Math.floor((phase / (2 * Math.PI)) + 0.5))) - 1;
  return Math.sin(phase);
};

// 👈 নিশ্চিত হোন এই export কিওয়ার্ডটি এখানে আছে
export const generateSongWave = (songSeed) => {
  const rng = seedrandom(String(songSeed));

  const tempo = 80 + Math.floor(rng() * 65);
  const beatLength = 60 / tempo;

  const rootNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const root = rootNotes[Math.floor(rng() * rootNotes.length)];
  const scaleType = rng() > 0.45 ? 'major' : 'minor';
  const intervals = scaleType === 'major' ? majorIntervals : minorIntervals;

  const waveformType = ['sine', 'square', 'triangle', 'sawtooth'][Math.floor(rng() * 4)];

  const chordProgressions = [
    [intervals[0], intervals[2], intervals[4]],
    [intervals[3], intervals[5], intervals[7]],
    [intervals[4], intervals[6], intervals[7]],
    [intervals[0], intervals[3], intervals[5]]
  ];

  const melodyPattern = Array.from({ length: 16 }, () => intervals[Math.floor(rng() * intervals.length)]);

  const totalSamples = SAMPLE_RATE * DURATION_SECONDS;
  const samples = new Float32Array(totalSamples).fill(0);

  const addNote = (startTime, noteInterval, durationSeconds, amplitude) => {
    const freq = noteToFrequency(root, noteInterval);
    const startSample = Math.floor(startTime * SAMPLE_RATE);
    const endSample = Math.min(totalSamples, Math.floor((startTime + durationSeconds) * SAMPLE_RATE));

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / SAMPLE_RATE;
      const progress = (i - startSample) / (endSample - startSample);
      const phase = 2 * Math.PI * freq * t;
      samples[i] += amplitude * envelope(progress) * waveform(phase, waveformType);
    }
  };

  let currentTime = 0;
  const chordStepDuration = beatLength * 2;
  for (let i = 0; i < 4; i++) {
    const chordNotes = chordProgressions[i % chordProgressions.length]; 
    if (currentTime < DURATION_SECONDS) {
      for (const noteInterval of chordNotes) {
        addNote(currentTime, noteInterval - 12, chordStepDuration * 0.95, 0.12);
      }
    }
    currentTime += chordStepDuration;
  }

  currentTime = 0;
  const melodyStepDuration = beatLength * 0.5;
  for (let noteInterval of melodyPattern) {
    if (currentTime < DURATION_SECONDS) {
      addNote(currentTime, noteInterval, melodyStepDuration * 0.85, 0.18);
      currentTime += melodyStepDuration;
    }
  }

  let maxSample = 0;
  for (let i = 0; i < totalSamples; i++) {
    if (Math.abs(samples[i]) > maxSample) {
      maxSample = Math.abs(samples[i]);
    }
  }

  const scale = maxSample > 1 ? 0.95 / maxSample : 0.95; 
  const intData = new Int16Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    intData[i] = Math.round(samples[i] * scale * MAX_AMPLITUDE);
  }

  return createWav(intData);
};

const createWav = (samples) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    view.setInt16(offset, samples[i], true);
  }

  const uint8Array = new Uint8Array(buffer);
  return Buffer.from(uint8Array); 
};