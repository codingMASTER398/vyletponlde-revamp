const lev = require(`js-levenshtein`);
const fs = require(`fs`);
const trackFiles = fs.readdirSync(`../webpunk/data/songs`);

// Main function
let RAWlyrics = [],
  lyrics = [],
  uniqueLyrics = [];

// Store all the lyrics in memory
for (let i = 0; i < trackFiles.length; i++) {
  const file = `../webpunk/data/songs/` + trackFiles[i];
  const data = require(file);

  if (!data.lyrics) continue;

  for (let i = 0; i < data.lyrics.length; i++) {
    const lyric = data.lyrics[i].replaceAll(`\r`, ``); // fuck windows

    RAWlyrics.push({
      lyric,
      from: data.nameId,
    });
  }
}

for (let i = 0; i < RAWlyrics.length; i++) {
  const lyric = RAWlyrics[i];

  /// uhm what the fuck am i doing ????
  if (lyrics.find((l) => l.lyric === lyric.lyric)) continue; // fuck.

  const allOccurences = RAWlyrics.filter((l) => l.lyric === lyric.lyric);
  let allIn = [];

  // uhhhh
  allOccurences.forEach((oc) => {
    // i don't know how to array.reduce
    if (!allIn.includes(oc.from)) allIn.push(oc.from);
  });

  // this is not confusing at all what are you on about it's fine it's fine trust me vro
  // update: it doesn't fucking work
  // update: we are so back i think
  lyrics.push({
    lyric: lyric.lyric,
    from: allIn
  })
}

// Now compare. It's inefficient, yes, but whateverrrrrr
for (let i = 0; i < lyrics.length; i++) {
  const lyric = lyrics[i].lyric;
  let foundMatch = false;

  for (let ii = 0; ii < lyrics.length; ii++) {
    if (ii === i) continue;
    const lyric2 = lyrics[ii].lyric;

    if (lev(lyric, lyric2) < 10) {
      foundMatch = true;
      break;
    }
  }

  if (!foundMatch) uniqueLyrics.push(lyrics[i]);
}

fs.writeFileSync(`./uniqueLyrics.json`, JSON.stringify(uniqueLyrics));
