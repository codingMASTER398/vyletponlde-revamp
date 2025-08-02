const fs = require(`fs`)

let tracks = {}

const trackFiles = fs.readdirSync(`../webpunk/data/songs`)

for (let i = 0; i < trackFiles.length; i++) {
  const file = `../webpunk/data/songs/` + trackFiles[i];
  const data = require(file)

  tracks[data.id] = data;
}

console.log(`Tracks: ${Object.keys(tracks).length}`)

module.exports = tracks;