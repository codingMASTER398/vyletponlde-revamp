const greekUtils = require("greek-utils");
const config = require(`../webpunk-feather/config/scraper.json`);

function makeAcronym(text) {
  return text
    .split(/\s/)
    .reduce((accumulator, word) => accumulator + word.charAt(0), "");
}

function convertToAcronyms(text, id) {
  // Remove (feat.) and [feat.]
  text = text
    .toLowerCase()
    .replace(/ *\([^)]*\) */g, " ")
    .replace(/[\[\]']+/g, "")
    .trim();

  let out = [];

  const phoneticLatin = greekUtils.toPhoneticLatin(text);
  const greeklish = greekUtils.toGreeklish(text);
  const acronym = makeAcronym(text.replace(/[^a-zA-Z 0-9]/g, ""));
  const acronymSimplified = makeAcronym(
    text
      .replace(/[^a-zA-Z 0-9]/g, "")
      .replaceAll("is", "")
      .replaceAll("a", "")
      .replaceAll("and", "")
      .replaceAll("the", "")
      .replaceAll("of", "")
  );

  if (acronym.length > 1 && acronym != text) out.push(acronym);
  if (phoneticLatin.length > 1 && phoneticLatin != text)
    out.push(phoneticLatin);
  if (greeklish.length > 1 && greeklish != text) out.push(greeklish);
  if (acronymSimplified.length > 1 && acronymSimplified != text)
    out.push(acronymSimplified);

  if (config.ACRONYMS[id]) out = [...out, ...config.ACRONYMS[id]];

  return out;
}

const fs = require(`fs`);

const trackFiles = fs.readdirSync(`../webpunk-feather/data/songs`);

module.exports = () => {
  for (let i = 0; i < trackFiles.length; i++) {
    const file = `../webpunk-feather/data/songs/` + trackFiles[i];
    const data = require(file);

    data.acronyms = convertToAcronyms(data.title, data.nameId);

    fs.writeFileSync(file, JSON.stringify(data));
  }
};
