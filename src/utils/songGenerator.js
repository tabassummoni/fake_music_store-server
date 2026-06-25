import { Faker, en, de, uk } from '@faker-js/faker';
import seedrandom from 'seedrandom';
import { localeData } from '../data/locales.js';
import { generateMusicAndCoverMeta } from './musicCoverGenerator.js';

const fakers = {
  en: new Faker({ locale: [en] }),
  de: new Faker({ locale: [de] }),
  uk: new Faker({ locale: [uk] })
};

const fallbackFaker = fakers.en;

const safeCall = (faker, fn) => {
  try {
    return fn(faker);
  } catch {
    return fn(fallbackFaker);
  }
};

const calculateLikes = (avgLikes, likesRng) => {
  const baseLikes = Math.floor(avgLikes);
  const remainder = avgLikes - baseLikes;
  return likesRng() < remainder ? baseLikes + 1 : baseLikes;
};

export const generateSongsBatch = (locale, userSeed, page, avgLikes) => {
  const currentFaker = fakers[locale] || fakers['en'];

  const combinedSeed = `${userSeed}-${page * 1103515245 + 12345}`;
  const mainRng = seedrandom(combinedSeed);

  const batchSize = 20;
  const songs = [];

  for (let i = 0; i < batchSize; i++) {
    const sequenceIndex = (page - 1) * batchSize + i + 1;
    const songSongSeed = Math.abs(mainRng.int32());

    const songMetadataRng = seedrandom(`metadata-${songSongSeed}`);
    const currentFakerSeed = Math.abs(songMetadataRng.int32());
    currentFaker.seed(currentFakerSeed);
    fallbackFaker.seed(currentFakerSeed);

    const isSingle = songMetadataRng() > 0.75;
    const localeConfig = localeData[locale] || localeData.en;
    
    const artist = songMetadataRng() > 0.4
      ? generateArtist(currentFaker, localeConfig, songMetadataRng)
      : generateBand(currentFaker, localeConfig, songMetadataRng);

    const title = generateTitle(currentFaker, localeConfig, songMetadataRng);

    const albumTitle = isSingle
      ? (locale === 'uk' ? 'Сингл' : 'Single')
      : generateAlbumTitle(currentFaker, localeConfig, songMetadataRng);

    const genre = localeConfig.genres[Math.floor(songMetadataRng() * localeConfig.genres.length)];

    const reviewsAndLikesRng = seedrandom(`review-like-${songSongSeed}`);
    const reviewFakerSeed = Math.abs(reviewsAndLikesRng.int32());
    currentFaker.seed(reviewFakerSeed);
    fallbackFaker.seed(reviewFakerSeed);

    const reviewText = generateReview(currentFaker, locale, reviewsAndLikesRng);
    const likes = calculateLikes(avgLikes, reviewsAndLikesRng);

    const meta = generateMusicAndCoverMeta(songSongSeed);
    const audioUrl = `/api/songs/${songSongSeed}/audio`;

    songs.push({
      id: `${userSeed}-${page}-${i}`,
      sequenceIndex,
      title,
      artist,
      albumTitle,
      genre,
      likes,
      reviewText,
      songSeed: songSongSeed,
      coverProps: meta.coverProps,
      audioProps: { selectedTrack: audioUrl }
    });
  }

  return songs;
};

const generateArtist = (faker, locale, rng) => {
  const formatIndex = Math.floor(rng() * locale.artistFormats.length);
  const format = locale.artistFormats[formatIndex];

  if (format === '{bandName}') {
    return safeCall(faker, (f) => f.music.genre()) + ' ' + locale.bandLiteral;
  }
  return safeCall(faker, (f) => f.person.firstName()) + ' ' + safeCall(faker, (f) => f.person.lastName());
};

const generateBand = (faker, locale, rng) => {
  return safeCall(faker, (f) => f.word.adjective()) + ' ' + locale.bandLiteral;
};

const generateTitle = (faker, locale, rng) => {
  return safeCall(faker, (f) => f.music.songName());
};

const generateAlbumTitle = (faker, locale, rng) => {
  return safeCall(faker, (f) => f.word.noun()) + ' ' + safeCall(faker, (f) => f.word.adjective());
};

const generateReview = (faker, locale, rng) => {
  return safeCall(faker, (f) => f.lorem.paragraph(1));
};