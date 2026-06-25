import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSongsBatch } from './src/utils/songGenerator.js';
import { generateSongWave } from './src/utils/audioGenerator.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/songs', (req, res) => {
  try {
    const { locale = 'en', seed = '12345', page = 1, likes = 0 } = req.query;

    const songs = generateSongsBatch(
      locale,
      seed,
      parseInt(page),
      parseFloat(likes)
    );

    res.status(200).json(songs);

  } catch (error) {
    console.error('Song generation error:', error.message || error);
    res.status(500).json({ success: false, message: 'Server error in generation' });
  }
});

app.get('/api/songs/:songSeed/audio', (req, res) => {
  try {
    const { songSeed } = req.params;    
    const audioBuffer = generateSongWave(songSeed, 180);

    res.writeHead(200, {
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length,
      'Accept-Ranges': 'bytes'
    });
    res.end(audioBuffer);
  } catch (error) {
    console.error('Playback streaming error:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running cleanly on port ${PORT}`));