const { promisify } = require(`util`)
const fs = require(`fs`);
const trackFiles = fs.readdirSync(`../webpunk/data/songs`);
const { exec } = require(`child_process`);

/*async function generateWaveform(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    FfmpegCommand(inputPath)
      .complexFilter([
        '[0:a]aformat=channel_layouts=mono,compand=gain=-6,showwavespic=s=6000x300:colors=#2bfbf5[fg]',
        'color=s=6000x300:color=#44582c,drawgrid=width=iw/10:height=ih/5:color=#9cf42f@0.1[bg]',
        '[bg][fg]overlay=format=auto,drawbox=x=(iw-w)/2:y=(ih-h)/2:w=iw:h=1:color=#9cf42f'
      ])
      .frames(1)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}*/

function generateWaveform(inputPath, outputPath) {
  return exec(`audiowaveform -i ${inputPath} -o ${outputPath} --width 6000 -z auto -b 16 --height 300 --waveform-color 6561d0 --background-color c7f5ff --amplitude-scale 0.8 --no-axis-labels`) 
}

// audiowaveform -i ../webpunk/data/downloadCache/antonymph.mp3 -o test2.png --width 6000 -z auto -b 16 --height 300 --waveform-color 6561d0 --background-color c7f5ff --amplitude-scale 0.8 --no-axis-labels 

//generateWaveform(`../webpunk/data/downloadCache/antonymph.mp3`, "./test.png")


module.exports = async () => {
//;(async()=>{
  for (let i = 0; i < trackFiles.length; i++) {
    const file = `../webpunk/data/songs/` + trackFiles[i];
    const data = require(file);
    const location = `../webpunk/data/waveforms/${data.nameId}.png`

    if(!fs.existsSync(location)) {
      await generateWaveform(`../webpunk/data/downloadCache/${data.nameId}.mp3`, location)
    }
  }
//})();
};
//