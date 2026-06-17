import { Faker, en, de } from '@faker-js/faker';
import seedrandom from 'seedrandom';


const fakers = {
  en: new Faker({ locale: [en] }),
  de: new Faker({ locale: [de] })
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


  const combinedSeed = `${userSeed}-${page * 13 + 7}`;
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

    const isSingle = songMetadataRng() > 0.6; 

    const artist = songMetadataRng() > 0.4
      ? safeCall(currentFaker, (f) => f.person.fullName())
      : `${safeCall(currentFaker, (f) => f.word.adjective())} ${safeCall(currentFaker, (f) => f.word.noun())}`;
      
    const title = safeCall(currentFaker, (f) => f.music.songName());
    
    const albumTitle = isSingle
      ? 'Single'
      : `${safeCall(currentFaker, (f) => f.word.noun())} ${safeCall(currentFaker, (f) => f.word.adjective())}`;
      
    const genre = safeCall(currentFaker, (f) => f.music.genre());

    
    
    const reviewsAndLikesRng = seedrandom(`review-like-${songSongSeed}`);
    
    
    const reviewFakerSeed = Math.abs(reviewsAndLikesRng.int32());
    currentFaker.seed(reviewFakerSeed);
    fallbackFaker.seed(reviewFakerSeed);

    const reviewText = `${safeCall(currentFaker, (f) => f.word.adjective())} track. ${safeCall(currentFaker, (f) => f.lorem.sentence())}`;

    
    const likes = calculateLikes(avgLikes, reviewsAndLikesRng);

    songs.push({
      id: `${combinedSeed}-${i}`,
      sequenceIndex,
      title,
      artist,
      albumTitle,
      genre,
      likes,
      reviewText,
      songSeed: songSongSeed 
    });
  }

  return songs;
};