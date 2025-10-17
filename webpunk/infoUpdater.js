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

function processSong(downloadURL, trackURL, albumInfo, id, title, lyrics) {
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

  lyrics =
    lyrics?.split?.("\n")?.filter?.((line) => {
      return line.length > 10 && !line.includes("(") && !line.includes("[");
    }) || [];

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
      lyrics: lyrics.length > 10 ? lyrics : null,
    })
  );
}

async function updateAlbums() {
  for (let i = 0; i < albumsList.length; i++) {
    const albumURL = albumsList[i];
    if (albumURL.includes("track")) continue;

    const id = albumURL.split("/album/")[1].replaceAll(`.`, `-`); // No directory traversal for you!
    if (config.ALBUM_EXCLUDES.includes(id)) {
      console.log(`Skipping album ${id}, in exclude list`);
      continue;
    }

    const albumInfo = await bandcampP.getAlbumInfoPromise(albumURL);

    // Download the album image
    if (!fs.existsSync(`./data/albumImages/${id}.jpg`))
      download(albumInfo.imageUrl, `./data/albumImages/${id}.jpg`);

    if (!albumInfo?.raw?.trackinfo) {
      console.warn(`Album ${id} doesn't have track info`);
      continue;
    }

    let newFound = false;

    for (let ii = 0; ii < albumInfo.raw.trackinfo.length; ii++) {
      const track = albumInfo.raw.trackinfo[ii];

      if (!track?.file?.["mp3-128"]) {
        console.warn(`Track ${track.title} doesn't have a file`);
        continue;
      }

      const title_id = getTitleID(track.title_link);
      if (
        config.EXCLUDE.find((e) => title_id.includes(e)) ||
        config.EXCLUDE_EXACT.includes(title_id) ||
        fs.existsSync(`./data/songs/${title_id}.json`)
      ) {
        console.log(`Already gotten ${title_id}`)
        continue; // Exlcuded
      }

      newFound = true;

      bandcampP
        .getTrackInfoPromise(config.ARTIST_URL + track.title_link)
        .then((trackData) => {
          processSong(
            track?.file?.["mp3-128"],
            track.title_link,
            albumInfo,
            track.id,
            track.title,
            trackData?.raw?.current?.lyrics || []
          );
        });
    }

    if(newFound) await sleep(15_000); // so as not to awaken the ratelimit demons
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

function updateSingle(singleURL) {
  return new Promise(async (continueSearch) => {
    const parsedURL = getTitleID(singleURL);

    // Make sure it isn't excluded or we've already done it

    if (
      config.EXCLUDE.find((e) => parsedURL.includes(e)) ||
      config.EXCLUDE_EXACT.includes(parsedURL)
    ) {
      continueSearch();
      return;
    }

    if (
      fs.existsSync(`./data/songs/${parsedURL}.json`) &&
      require(`./data/songs/${parsedURL}.json`).id
    ) {
      console.log("Already got");
      if (require(`./data/songs/${parsedURL}.json`).id) {
        continueSearch();
        return;
      }
    }

    // Get the data from bandcamp
    let data;

    try {
      console.log(singleURL);
      data = await bandcampP.getTrackInfoPromise(singleURL);
    } catch (e) {
      console.error(e);
      continueSearch();
      return;
    }

    //continueSearch();

    // Get the audio file URL
    if (
      !data?.raw?.freeDownloadPage &&
      !data?.raw?.trackinfo?.[0]?.file?.["mp3-128"]
    ) {
      console.warn(`${singleURL} doesn't have a free download`);
      continueSearch();
      return;
    }

    const downloadURL =
      data?.raw?.trackinfo?.[0]?.file?.["mp3-128"] ||
      (await getSingleDownloadURL(data.raw.freeDownloadPage));
    if (!downloadURL) {
      console.warn(`${singleURL} can't parse download URL`);
      continueSearch();
      return;
    }

    // Download the cover image
    if (
      !fs.existsSync(`./data/albumImages/${data.id}.jpg`) &&
      data?.raw?.freeDownloadPage
    ) {
      const imageURL = await getImageURL(data?.raw?.freeDownloadPage);
      download(imageURL, `./data/albumImages/${parsedURL}.jpg`);
    }

    // Process it
    processSong(
      downloadURL,
      data.url,
      null,
      data?.trackId || data.id,
      data.title,
      data?.raw?.current?.lyrics || []
    );

    continueSearch();
  });
}

async function updateSingles() {
  for (let i = 0; i < singles.length; i++) {
    try {
      // Compute 3 at once before awaiting, i don't got all day
      if (i % 3 === 0) await updateSingle(singles[i]);
      else updateSingle(singles[i]);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = async () => {
  console.log(`Updating albums list...`);
  //await updateAlbumsList();

  console.log(`Updating albums...`);
  //await updateAlbums();

  console.log(`Updating singles...`);
  await updateSingles();
};
