const express = require("express");
const crypto = require(`crypto`);
const router = express.Router();

const config = require(`../config/site.json`);
const tracks = require(`../util/tracks`);
const uniqueLyrics = require(`../webpunk/uniqueLyrics.json`);
const fs = require(`fs`);

function randomer() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array); // actually good randomness
  return array[0] / (0xffffffff + 1); // normalized to [0,1)
}

function getImageId(track) {
  if (track.albumURL) {
    return track.albumURL.split("/album/")[1];
  } else if (fs.existsSync(`../webpunk/data/albumImages/${track.nameId}.jpg`))
    return track.nameId;
  else return `notfound`;
}

function getGameDataLyric(mode) {
  const tracksToSend = uniqueLyrics
    .map((value) => ({ value, sort: randomer() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 5)
    .map(({ value }) => {
      const related = Object.values(tracks).find((t)=>value.from.includes(t.nameId));

      return {
        title: related.title,
        album: related.album,
        bandcamp: related.url,
        audio: related.nameId + ".ogg",
        id: related.id,
        image: getImageId(related),
        lyric: value.lyric
      };
    });

  return {
    tracks: tracksToSend,
    mode,
    v: 1,
  };
}

function getGameData(mode = "") {
  let possibleTracks = Object.values(tracks);

  if (mode.includes("lyric")) {
    return getGameDataLyric(mode);
  }

  if (mode.includes("easy")) {
    possibleTracks = possibleTracks.filter((t) => {
      return config.easyAlbums.includes(t.album);
    });
  }
  if (mode.includes("hard")) {
    possibleTracks = possibleTracks.filter((t) => {
      return (
        !config.easyAlbums.includes(t.album) &&
        !config.neutralAlbums.includes(t.album)
      );
    });
  }

  const tracksToSend = possibleTracks
    .map((value) => ({ value, sort: randomer() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 5)
    .map(({ value }) => {
      const slice1 = Math.floor(Math.random() * 9) + 1;
      let slice2 = -1;

      while (slice2 == -1 || slice2 == slice1) {
        slice2 = Math.floor(Math.random() * 9) + 1;
      }

      return {
        title: value.title,
        audio: value.nameId + ".ogg", // lol .ogg.ogg, dual weilding
        album: value.album,
        bandcamp: value.url,
        id: value.id,
        image: getImageId(value),
        slice1,
        slice2,
      };
    });

  return {
    tracks: tracksToSend,
    mode,
    v: 1,
  };
}

function fixGameData(data) {
  if (!data.v && !data.tracks[0].v) {
    // Old data without slices
    for (let i = 0; i < data.tracks.length; i++) {
      data.tracks[i].audio = data.tracks[i].audio.split(`/api/audio/`)[1];
      data.tracks[i].slice1 = 5;
      data.tracks[i].slice2 = 3;
      data.tracks[i].v = 1;
    }

    data.v = 1;
  }

  return data;
}

module.exports = {
  router,
  getGameData,
  fixGameData,
};
