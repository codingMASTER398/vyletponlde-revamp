// Imports

const config = require(`../config/site.json`);

const requestIp = require("request-ip");
const express = require(`express`);
const app = express();

require("dotenv").config();

app.use(require("compression")());

const db = require(`../db/db`);
const api = require("../api/index");
const ponlde = require("./ponlde");
const circlesOfHell = require("./circlesOfHell");
const ytChat = require("./youtubeChat");
const discord = require("./discord");
//const archives = require("./archives");
const tracks = require(`../util/tracks`);

//
app.set(`view engine`, `ejs`);
app.use(requestIp.mw());

app.use("/api", api);
app.use("/yt", ytChat);
app.use("/vyletDiscord", discord);

//app.use("/archive", archives);
app.use("/", ponlde);
app.use("/circles-of-hell", circlesOfHell);

app.get("/", (_, res) =>
  res.render("homeNew", {
    archiveNormal: db
      .days()
      .find({
        mode: "normal",
      })
      .reverse(),
    archiveEasy: db
      .days()
      .find({
        mode: "easy",
      })
      .reverse(),
    archiveLyric: db
      .days()
      .find({
        mode: "lyric",
      })
      .reverse(),
    archiveArt: db
      .days()
      .find({
        mode: "art",
      })
      .reverse(),
    generateRunID,
    config,
    tracks: Object.values(tracks).filter((s)=>!s.isFeatherSong),
  })
);
app.get("/homeold", (_, res) => res.render("home"));
app.get("/about", (_, res) => res.redirect("/"));
app.get("/songs", (_, res) => res.redirect("/"));
app.get("/archive", (_, res) => res.redirect("/"));
app.get("/archive/easy", (_, res) => res.redirect("/"));
app.get("/creekflowCaptcha", (_, res) => res.render(`creekflowcaptcha`));

app.use(
  `/`,
  express.static(`../static`, {
    maxAge: config.DEVELOPMENT ? 0 : 3600,
    immutable: true,
  })
);

app.use((req, res) => {
  res.status(404).render(`404`);
});

app.listen(config.PORT);

// one silly archive function
function generateRunID(data) {
  return (
    data.data.tracks[0].id +
    "-" +
    (data.data.tracks[1].id + "-") +
    (data.data.tracks[2].id + "-") +
    (data.data.tracks[3].id + "-") +
    data.data.tracks[4].id
  );
}
