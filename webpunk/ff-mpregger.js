// juicy file name
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const path = require(`path`)
const fs = require(`fs`)

ffmpeg.setFfmpegPath(ffmpegStatic)

function removeSilence(inputPath, outputPath) {
  console.log(inputPath, outputPath)

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters('silenceremove=1:0:-50dB:1:0:-50dB')
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .save(outputPath);
  });
}

function getDuration(file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

const formatTime = (s) => {
  const minutes = Math.floor(s / 60);
  const seconds = (s % 60).toFixed(3);
  return `${minutes}:${seconds.padStart(6, '0')}`;
};


/**
 * 
 * @param {String} input - input file
 * @param {String} output - output file
 * @param {Number} ss - trim start
 * @param {Number} t - trim length
 * @param {Boolean} fade - does ts fade by the 2 seconds?
 * @returns 
 */

function extractClip(input, output, ss, t, fade = false) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(input).setStartTime(formatTime(ss)).duration(t);
    if (fade) {
      cmd.audioFilters([
        `afade=t=in:ss=0:d=1`,
        `afade=t=out:st=${t - 2}:d=1`,
      ]);
    }
    cmd.on('end', () => resolve(output))
      .on('error', reject)
      .save(output);
  });
}

function concatClips(outputs, finalOutput) {
  const cwd = process.cwd().includes("webpunk")
    ? process.cwd().replace("/site", "")
    : path.join(process.cwd(), "webpunk");

  const tempFilePath = path.join(cwd, "data", "processingWork", `temp-${String(Math.random()).replace(".", "")}`);

  console.log(outputs)

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(outputs[0])
      .input(outputs[1])
      .input(outputs[2])
      .input(outputs[3])
      .on("end", () => resolve(finalOutput))
      .on("error", reject)
      .mergeToFile(finalOutput, tempFilePath);
  });
}

module.exports = {
  removeSilence,
  getDuration,
  extractClip,
  concatClips
}