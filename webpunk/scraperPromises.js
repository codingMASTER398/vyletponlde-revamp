const bandcamp = require("bandcamp-scraper");

function getAlbumInfoPromise(albumURL) {
  return new Promise((res, rej)=>{
    bandcamp.getAlbumInfo(albumURL, (error, data)=>{
      error && rej(error) || res(data); // Super legible, super lovely.
    })
  })
}

function getTrackInfoPromise(trackURL) {
  return new Promise((res, rej)=>{
    bandcamp.getTrackInfo(trackURL, (error, data)=>{
      error && rej(error) || res(data); // Super legible, super lovely.
    })
  })
}

module.exports = {
  getAlbumInfoPromise,
  getTrackInfoPromise
}