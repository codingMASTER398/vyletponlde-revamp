const express = require("express");
const router = express.Router();

const gameAPI = require(`../api/game`);

router.get("/:num/intro", (_, res) => {
  if (_.params.num < 1 || _.params.num > 9) {
    res.status(404).send(`what`);
    return;
  }

  res.render(`circleIntro`, { circle: _.params.num });
});

router.get("/1/task", (_, res) => {
  const gameData = {
    ...gameAPI.getGameData("hard"),
    copyDescription: "circle 1",
    hardcore: true,
    oneshot: true,
    circle: 1,
  };

  res.render(`ponlde.ejs`, {
    gameData: gameAPI.fixGameData(gameData),
  });
});

router.get("/2/task", (_, res) => {
  const gameData = {
    ...gameAPI.getGameData("lyric", 10),
    copyDescription: "circle 2",
    lyricMode: true,
    oneshot: true,
    circle: 2,
    amountOverride: 10,
  };

  res.render(`ponlde.ejs`, {
    gameData: gameAPI.fixGameData(gameData),
  });
});

router.get("/3/task", (_, res) => {
  const gameData = {
    ...gameAPI.getGameData("art", 10),
    copyDescription: "circle 3",
    artMode: true,
    hardcoreArt: true,
    oneshot: true,
    hardcore: true,
    circle: 3,
    amountOverride: 10,
  };

  res.render(`ponlde.ejs`, {
    gameData: gameAPI.fixGameData(gameData),
  });
});

router.get("/4/task", (_, res) => {
  const gameData = {
    ...gameAPI.getGameData("normal", 12),
    copyDescription: "circle 4",
    hardcore: true,
    circle: 4,
    speedrun: true,
    amountOverride: 12,
  };

  res.render(`ponldeSpeedrun.ejs`, {
    gameData: gameAPI.fixGameData(gameData),
  });
});

router.get("/5/task", (_, res) => {
  const gameData = {
    ...gameAPI.getGameData("normal", 5, true),
    copyDescription: "circle 5",
    circle: 5,
    featherMode: true,
    oneshot: true,
  };

  res.render(`ponlde.ejs`, {
    gameData: gameAPI.fixGameData(gameData),
  });
});

router.get("/6/task", (_, res) => {
  res.redirect(`/circles-of-hell/7/intro`)
  //res.render(`chatCount.ejs`);
});

router.get("/7/task", (_, res) => {
  const gameData = {
    ...gameAPI.getGameData("normal", 100),
    copyDescription: "circle 7",
    oneshot: true,
    onlyOnce: true,
    hardcore: true,
    amountOverride: 100,
    circle: 7,
  };

  res.render(`ponlde.ejs`, {
    gameData: gameAPI.fixGameData(gameData),
  });
});

router.get("/8/task", (_, res) => {
  const gameData = {
    ...gameAPI.getGameData("waveform", 1),
    copyDescription: "circle 8",
    waveformMode: true,
    oneshot: true,
    hardcore: true,
    circle: 8,
    amountOverride: 1
  };

  res.render(`ponlde.ejs`, {
    gameData: gameAPI.fixGameData(gameData),
  });
});

router.get("/9/task", (_, res) => {
  const gameData = {
    ...gameAPI.getGameData("hard", 10),
    copyDescription: "CIRCLE 9 HOLY MOLY",
    hidden: true,
    oneshot: true,
    hardcore: true,
    lodestar: true,
    vylet: true,
    circle: 9,
    amountOverride: 10
  };

  res.render(`ponlde.ejs`, {
    gameData: gameAPI.fixGameData(gameData),
  });
});

module.exports = router;
