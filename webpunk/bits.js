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
    processingFile1 = `${dir}/${inputName}-s.mp3`, // Silence trimmed
    processingFile2 = `${dir}/${inputName}-1.mp3`, // Clip 1
    processingFile3 = `${dir}/${inputName}-2.mp3`, // Clip 2
    processingFile4 = `${dir}/${inputName}-3.mp3`, // Clip 3
    processingFile5 = `${dir}/${inputName}-f.mp3`  // Fade clip

  console.log(`Removing silence`)
  await mpreg.removeSilence(inFile, processingFile1)
  const length = await mpreg.getDuration(processingFile1);

  console.log(`Extracting clips`)
  await mpreg.extractClip(processingFile1, processingFile2, length / 2, 0.5, false)
  await mpreg.extractClip(processingFile1, processingFile3, length / 3, 1, false)
  await mpreg.extractClip(processingFile1, processingFile4, 0, 3, false)
  await mpreg.extractClip(processingFile1, processingFile5, length / 2.5, 10, true)

  console.log("Concatonating")
  await mpreg.concatClips([
    processingFile5,
    processingFile4,
    processingFile3,
    processingFile2
  ], outFile)

  fs.rmdirSync(dir, {
    recursive: true
  })
}

// Process the bits

function sleep(ms) {
  return new Promise((r)=>setTimeout(r, ms))
}

(async () => {
  fs.rmdirSync(`./data/processingWork`, {
    recursive: true
  })
  fs.mkdirSync(`./data/processingWork`)

  for (let i = 0; i < downloads.length; i++) {
    //if(downloads[i] != "antonymph.mp3") continue;
    const outFile = `./data/bits/${downloads[i].replace(`.mp3`, `.ogg`)}`

    if (fs.existsSync(outFile)) continue;

    await process(downloads[i].replace(`.mp3`, ``), outFile)

    //await sleep(2500)
    //return;
  }
})();
