const fs = require(`fs`);

const trackFiles = fs.readdirSync(`../webpunk/data/songs`);
const attribution = require(`../webpunk/art/attrib.json`)

module.exports = () => {
  let found = 0;


  for (let i = 0; i < trackFiles.length; i++) {
    const file = `../webpunk/data/songs/` + trackFiles[i];
    const data = require(file);

    if(fs.existsSync(`../webpunk/art/unprocessed/${data.nameId}.png`) || fs.existsSync(`../webpunk/art/unprocessed/${data.nameId}.jpg`)) {
      found++;
      if(!attribution[data.nameId]) {
        console.log(data.nameId)
        continue;
      }

      data.coverArtAttribution = attribution[data.nameId];
      fs.writeFileSync(file, JSON.stringify(data));
    }

    //data.acronyms = convertToAcronyms(data.title, data.nameId);

    //fs.writeFileSync(file, JSON.stringify(data));
  }
};
