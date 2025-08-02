// I support copyright infringement
const config = require(`../config/scraper.json`);
const singles = require(`../config/singles.json`);
const bandcamp = require("bandcamp-scraper");
const bandcampP = require(`./scraperPromises.js`);
const https = require("https");
const fs = require(`fs`);

let albumsList = require(`./data/albumList.json`);
let albums = {};

// Updates the list of all albums
function updateAlbumsList() {
  return new Promise(async (resolve, reject) => {
    const cb = (error, yay) => {
      if (error) {
        reject(error);
        return;
      }

      // Got the new albums
      yay.forEach((album) => {
        if (!albumsList.includes(album)) {
          albumsList.push(album);
          console.log(`New album: ${album}`);
        }
      });

      // Write all albums
      fs.writeFileSync(`./data/albumList.json`, JSON.stringify(albumsList));

      // Return
      resolve(true);
    };

    bandcamp.getAlbumUrls(config.ARTIST_URL, cb);
  });
}

function download(url, location) {
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

// Updates each individual album
let duplicateBuster = [];

function getTitleID(trackURL) {
  const title_id = trackURL.split("/track/")[1].replaceAll(`.`, `-`);
  return title_id.endsWith("-4") // Remove trailling -4, -3, -2. I don't care for extensibility here.
    ? title_id.replace("-4", "")
    : title_id.endsWith("-3")
      ? title_id.replace("-3", "")
      : title_id.endsWith("-2")
        ? title_id.replace("-2", "")
        : title_id;
}

function processSong(downloadURL, trackURL, albumInfo, id, title) {
  const title_id = getTitleID(trackURL);

  if (
    config.EXCLUDE.find((e) => title_id.includes(e)) ||
    config.EXCLUDE_EXACT.includes(title_id) ||
    fs.existsSync(`./data/songs/${title_id}.json`)
  ) {
    return; // Exlcuded
  }

  if (title_id.includes(`instrumental`) || duplicateBuster.includes(title_id)) {
    return; // Probably an instrumental or already added, skip!
  }

  duplicateBuster.push(title_id);

  fs.writeFileSync(
    `./data/songs/${title_id}.json`,
    JSON.stringify({
      id: id,
      nameId: title_id,
      title: title,
      url: trackURL,
      download: downloadURL,
      album: albumInfo?.raw?.current?.title || "Singles",
      albumURL: albumInfo?.url || null,
    })
  );
}

async function updateAlbums() {
  for (let i = 0; i < albumsList.length; i++) {
    const albumURL = albumsList[i];
    const id = albumURL.split("/album/")[1].replaceAll(`.`, `-`); // No directory traversal for you!

    const albumInfo = await bandcampP.getAlbumInfoPromise(albumURL);

    // Download the album image
    if (!fs.existsSync(`./data/albumImages/${id}.jpg`))
      download(albumInfo.imageUrl, `./data/albumImages/${id}.jpg`);

    if (!albumInfo?.raw?.trackinfo) {
      console.warn(`Album ${id} doesn't have track info`);
      continue;
    }

    for (let ii = 0; ii < albumInfo.raw.trackinfo.length; ii++) {
      const track = albumInfo.raw.trackinfo[ii];

      if (!track?.file?.["mp3-128"]) {
        console.warn(`Track ${track.title} doesn't have a file`);
        continue;
      }

      processSong(
        track?.file?.["mp3-128"],
        track.title_link,
        albumInfo,
        track.id,
        track.title
      );
    }
  }
}

async function getSingleDownloadURL(freeDownloadPage) {
  // Totally not piracy. it's a free download anyway. copyright law killed my sister, okay?
  try {
    const json = JSON.parse(
      (
        await (
          await fetch(
            `https://popplers5.bandcamp.com/statdownload/track?enc=mp3-320&${freeDownloadPage.split("?")[1]}&.vrs=1`
          )
        ).text()
      )
        .split("statResult ( ")[1]
        .split(" ) ")[0]
    );

    return json.download_url;
  } catch (e) {
    console.error(e);
    return;
  }
}

async function getImageURL(freeDownloadPage) {
  const html = await (await fetch(freeDownloadPage)).text();

  return html.split(`class="download-thumbnail" src="`)?.[1]?.split?.('"')?.[0];
}

async function updateSingle(singleURL) {
  const parsedURL = getTitleID(singleURL);

  if(config.EXCLUDE.find((e) => parsedURL.includes(e)) ||
    config.EXCLUDE_EXACT.includes(parsedURL)) {
      return;
    };

  if (fs.existsSync(`./data/songs/${parsedURL}.json`)) {
    console.log("Already got");
    if(require(`./data/songs/${parsedURL}.json`).id) return; // monkey patch for redoing ones without ids for some reason
  }

  console.log(singleURL)

  let data;

  try {
    data = await bandcampP.getTrackInfoPromise(singleURL);
  } catch (e) {
    console.log(e, singleURL);
    return;
  }

  if (!data?.raw?.freeDownloadPage && !data?.raw?.trackinfo?.[0]?.file?.["mp3-128"]) {
    console.warn(`${singleURL} doesn't have a free download`);
    return;
  }

  const downloadURL = data?.raw?.trackinfo?.[0]?.file?.["mp3-128"] || await getSingleDownloadURL(data.raw.freeDownloadPage);
  if (!downloadURL) {
    console.warn(`${singleURL} can't parse download URL`);
    return;
  }

  // Download the image
  if (!fs.existsSync(`./data/albumImages/${data.id}.jpg`) && data?.raw?.freeDownloadPage) {
    const imageURL = await getImageURL(data?.raw?.freeDownloadPage);
    download(imageURL, `./data/albumImages/${parsedURL}.jpg`);
  }

  processSong(downloadURL, data.url, null, data?.trackId || data.id, data.title);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function updateSingles() {
  for (let i = 0; i < singles.length; i++) {
    try {
      updateSingle(singles[i]);
    } catch (e) {
      console.log(e);
    }
  }
}

(async () => {
  /*console.log(`Updating albums list...`);
  await updateAlbumsList();

  console.log(`Updating albums...`);
  await updateAlbums();*/

  console.log(`Updating singles...`);
  await updateSingles();
})();
