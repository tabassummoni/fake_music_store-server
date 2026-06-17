import seedrandom from 'seedrandom';

// musical properties and cover design patterns for generating music and album covers based on a unique seed for each song
const CHORD_PROGRESSIONS = [
  ['C4', 'G4', 'Am4', 'F4'], // Classic Pop
  ['Am4', 'F4', 'C4', 'G4'], // Emotional
  ['C4', 'Am4', 'F4', 'G4'], // 50s Doo-Wop
  ['Dm4', 'G4', 'C4', 'C4']  // Jazz-ish
];

const MELODY_NOTES = ['C5', 'D5', 'E5', 'G5', 'A5', 'B5', 'C6'];

export const generateMusicAndCoverMeta = (songSeed) => {
  const rng = seedrandom(songSeed);

  // 1. Music metadata generation (Seed-based)
  const tempo = Math.floor(rng() * (130 - 80 + 1)) + 80; // 80 to 130 BPM
  const progressionIndex = Math.floor(rng() * CHORD_PROGRESSIONS.length);
  const selectedChords = CHORD_PROGRESSIONS[progressionIndex];

  // Generate a random but melodic 8-note sequence
  const melodySequence = [];
  for (let i = 0; i < 8; i++) {
    const noteIndex = Math.floor(rng() * MELODY_NOTES.length);
    melodySequence.push(MELODY_NOTES[noteIndex]);
  }

  // 2. Album cover design metadata generation (No Hardcoding, Beautiful Patterns)
  const hue1 = Math.floor(rng() * 360);
  const hue2 = (hue1 + 120) % 360; 
  const bgGradient = `linear-gradient(${Math.floor(rng() * 360)}deg, hsl(${hue1}, 70%, 40%), hsl(${hue2}, 60%, 20%))`;
  
  const patternType = rng() > 0.5 ? 'circle' : 'polygon';
  const patternColor = `hsla(${(hue1 + 180) % 360}, 80%, 60%, 0.3)`;

  return {
    audioProps: {
      tempo,
      chords: selectedChords,
      melody: melodySequence
    },
    coverProps: {
      bgGradient,
      patternType,
      patternColor,
      blurAmount: Math.floor(rng() * 20) + 5
    }
  };
};