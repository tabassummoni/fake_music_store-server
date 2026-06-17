import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateSongsBatch } from './src/utils/songGenerator.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// single API endpoint (Batch-based data generation)
app.get('/api/songs', (req, res) => {
  try {
    const { locale = 'en', seed = '12345', page = 1, likes = 0 } = req.query;

    const songs = generateSongsBatch(
      locale,
      seed,
      parseInt(page),
      parseFloat(likes)
    );

    res.status(200).json({
      success: true,
      page: parseInt(page),
      data: songs
    });
  } catch (error) {
    console.error('Song generation error:', error.message || error);
    res.status(500).json({ success: false, message: 'Server error in generation' });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running cleanly on port ${PORT}`));