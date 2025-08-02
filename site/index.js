// Imports

const config = require(`../config/site.json`);

const express = require(`express`);
const app = express();

require('dotenv').config();

app.use(require("compression")());

const db = require(`../db/db`)
const api = require("../api/index");
const ponlde = require("./ponlde");
const archives = require("./archives");
const tracks = require(`../util/tracks`)
const webpunker = require(`../webpunk/webpunkTask`)

//
app.set(`view engine`, `ejs`);

app.use("/api", api);

app.use("/archive", archives);
app.use("/", ponlde);

app.get("/", (_, res) => res.render("home"));
app.get("/about", (_, res) => res.render("about"));
app.get("/songs", (_, res) => res.render("songs", {tracks}));

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
