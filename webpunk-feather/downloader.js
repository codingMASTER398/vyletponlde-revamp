// you wouldn't download a car
// (i totally would)

const config = require(`../webpunk-feather/config/scraper.json`);
const https = require("https");
const fs = require(`fs`);

const songs = fs.readdirSync(`./data/songs`);

function download(url, location) {
  // No error handling. Oopsie daisys! Better not fail on us.
  return new Promise((r) => {
    const writeStream = fs.createWriteStream(location);
    const request = https.get(url, function (response) {
      response.pipe(writeStream);

      // after download completed close filestream
      writeStream.on("finish", () => {
        writeStream.close();
        console.log("Download Completed");
        r();
      });
    });
  });
}

// Process the bits

module.exports = (async () => {
  let left = 0;

  for (let i = 0; i < songs.length; i++) {
    const song = require(`./data/songs/${songs[i]}`);

    if (fs.existsSync(`./data/bits/${song.nameId}`) || fs.existsSync(`./data/downloadCache/${song.nameId}.mp3`)) continue;

    left++;
    download(song.download, `./data/downloadCache/${song.nameId}.mp3`).then(()=>{
      left--;
    });
  }

  return new Promise((r)=>{
    const i = setInterval(()=>{
      if(left === 0) {
        clearInterval(i);
        r();
      }
    }, 100)
  })
});
