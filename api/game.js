const express = require("express");
const crypto = require(`crypto`);
const router = express.Router();

const config = require(`../config/site.json`)
const tracks = require(`../util/tracks`);
const fs = require(`fs`);

function randomer() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array); // actually good randomness
  return array[0] / (0xFFFFFFFF + 1); // normalized to [0,1)
}

function getImageId(track) {
  if (track.albumURL) {
    return track.albumURL.split("/album/")[1];
  } else if (fs.existsSync(`../webpunk/data/albumImages/${track.nameId}.jpg`))
    return track.nameId;
  else return `notfound`;
}

function getGameData(mode = "") {
  let possibleTracks = Object.values(tracks)

  if(mode.includes("easy")) {
    possibleTracks = possibleTracks.filter((t)=>{
      return config.easyAlbums.includes(t.album)
    })
  }
  if(mode.includes("hard")) {
    possibleTracks = possibleTracks.filter((t)=>{
      return !config.easyAlbums.includes(t.album) && !config.neutralAlbums.includes(t.album)
    })
  }

  const tracksToSend = possibleTracks
    .map((value) => ({ value, sort: randomer() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 5)
    .map(({ value }) => {
      return {
        title: value.title,
        audio: `/api/audio/${value.nameId}.ogg`,
        album: value.album,
        bandcamp: value.url,
        id: value.id,
        image: getImageId(value),
      };
    });

  return {
    tracks: tracksToSend,
    mode
  };
}

module.exports = {
  router,
  getGameData,
};
