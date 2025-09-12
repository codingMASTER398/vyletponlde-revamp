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
//const archives = require("./archives");
const tracks = require(`../util/tracks`);
const webpunker = require(`../webpunk/webpunkTask`);

//
app.set(`view engine`, `ejs`);
app.use(requestIp.mw());

app.use("/api", api);

//app.use("/archive", archives);
app.use("/", ponlde);

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
    generateRunID,
    config,
    tracks
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
