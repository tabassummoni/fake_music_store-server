import seedrandom from 'seedrandom';

const CHORD_PROGRESSIONS = [
  ['C4', 'G4', 'Am4', 'F4'],
  ['Am4', 'F4', 'C4', 'G4'],
  ['C4', 'Am4', 'F4', 'G4'],
  ['Dm4', 'G4', 'C4', 'C4']
];

const MELODY_NOTES = ['C5', 'D5', 'E5', 'G5', 'A5', 'B5', 'C6'];

export const generateMusicAndCoverMeta = (songSeed) => {
  const rng = seedrandom(String(songSeed));

  const tempo = Math.floor(rng() * (130 - 80 + 1)) + 80;
  const progressionIndex = Math.floor(rng() * CHORD_PROGRESSIONS.length);
  const selectedChords = CHORD_PROGRESSIONS[progressionIndex];

  const melodySequence = [];
  for (let i = 0; i < 8; i++) {
    const noteIndex = Math.floor(rng() * MELODY_NOTES.length);
    melodySequence.push(MELODY_NOTES[noteIndex]);
  }

  const hue1 = Math.floor(rng() * 360);
  const hue2 = (hue1 + 120 + Math.floor(rng() * 60)) % 360;

  const patternType = rng() > 0.5 ? 'circle' : 'polygon';
  const patternColor = `hsla(${(hue1 + 180) % 360}, 80%, 60%, 0.25)`;
  const blurAmount = Math.floor(rng() * 15) + 2;

  return {
    audioProps: {
      tempo,
      chords: selectedChords,
      melody: melodySequence
    },
    coverProps: {
      seed: songSeed,
      hue1,
      hue2,
      patternType,
      patternColor,
      blurAmount
    }
  };
};