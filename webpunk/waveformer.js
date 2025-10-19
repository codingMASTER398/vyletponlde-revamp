const FfmpegCommand = require(`fluent-ffmpeg`)
const { promisify } = require(`util`)
const fs = require(`fs`);
const trackFiles = fs.readdirSync(`../webpunk/data/songs`);

async function generateWaveform(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    FfmpegCommand(inputPath)
      .complexFilter([
        '[0:a]aformat=channel_layouts=mono,compand=gain=-6,showwavespic=s=6000x300:colors=#9cf42f[fg]',
        'color=s=6000x300:color=#44582c,drawgrid=width=iw/10:height=ih/5:color=#9cf42f@0.1[bg]',
        '[bg][fg]overlay=format=auto,drawbox=x=(iw-w)/2:y=(ih-h)/2:w=iw:h=1:color=#9cf42f'
      ])
      .frames(1)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

module.exports = async () => {
  for (let i = 0; i < trackFiles.length; i++) {
    const file = `../webpunk/data/songs/` + trackFiles[i];
    const data = require(file);
    const location = `../webpunk/data/waveforms/${data.nameId}.png`

    if(!fs.existsSync(location)) {
      await generateWaveform(`../webpunk/data/downloadCache/${data.nameId}.mp3`, location)
    }
  }
};
