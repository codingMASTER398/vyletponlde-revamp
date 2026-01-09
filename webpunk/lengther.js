const { exec } = require('child_process');

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    const cmd = `ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stderr);
      const duration = parseFloat(stdout.trim());
      if (isNaN(duration)) return reject(new Error('Could not parse duration'));
      resolve(duration); // Duration in seconds
    });
  });
}

const fs = require(`fs`);

const trackFiles = fs.readdirSync(`../webpunk/data/songs`);

module.exports = async () => {
  for (let i = 0; i < trackFiles.length; i++) {
    const file = `../webpunk/data/songs/` + trackFiles[i];
    const data = require(file);

    if(data.length) continue;

    data.length = await getAudioDuration(`./data/downloadCache/${data.nameId}.mp3`)

    fs.writeFileSync(file, JSON.stringify(data));
  }
};
