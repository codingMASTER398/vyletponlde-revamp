// you wouldn't process a car
// (i totally would)

const config = require(`../config/scraper.json`);
const mpreg = require(`./ff-mpregger`)
const fs = require(`fs`);

const downloads = fs.readdirSync(`./data/downloadCache`);

async function process(inputName, outFile) {
  const dir = `./data/processingWork/${String(Math.random()).replace(".", "")}`;

  fs.mkdirSync(dir)

  const inFile = `./data/downloadCache/${inputName}.mp3`,
    silenceTrimmedFile = `${dir}/${inputName}-s.mp3`, // Silence trimmed,
    startClip = `${dir}/${inputName}-startclip.mp3`,
    fadeClip = `${dir}/${inputName}-fadeclip.mp3`  // Fade clip

  console.log(`Removing silence`)
  await mpreg.removeSilence(inFile, silenceTrimmedFile)
  const length = await mpreg.getDuration(silenceTrimmedFile);

  console.log(`Extracting 1s tiny clips`)
  for (let i = 1; i < 10; i += 1) {
    await mpreg.extractClip(silenceTrimmedFile, `./data/bits/tiny/${i}-${outFile}.ogg`, length * (i * 0.1), 1, false)
  }

  console.log(`Extracting clips`)
  await mpreg.extractClip(silenceTrimmedFile, startClip, 0, 3, false)
  await mpreg.extractClip(silenceTrimmedFile, fadeClip, length / 2.5, 10, true)

  console.log(startClip, fadeClip,  `./data/bits/base/${outFile}.ogg`)

  console.log("Concatonating")
  await mpreg.concatClips([
    fadeClip, startClip
  ], `./data/bits/base/${outFile}.ogg`)

  fs.rmdirSync(dir, {
    recursive: true
  })
}

// Process the bits

function sleep(ms) {
  return new Promise((r)=>setTimeout(r, ms))
}

module.exports =  (async () => {
  fs.rmdirSync(`./data/processingWork`, {
    recursive: true
  })
  fs.mkdirSync(`./data/processingWork`)

  for (let i = 0; i < downloads.length; i++) {
    //if(downloads[i] != "antonymph.mp3") continue;
    const outFile = downloads[i].replace(`.mp3`, `.ogg`)

    if (fs.existsSync(`./data/bits/base/${outFile}.ogg`)) continue;

    await process(downloads[i].replace(`.mp3`, ``), outFile)

    //await sleep(2500)
    //return;
  }
});
