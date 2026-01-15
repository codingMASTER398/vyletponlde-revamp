const express = require("express");
const tracks = require("../util/tracks");
const router = express.Router();

function makeid(length) {
  let result = "";
  let characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

let guessIDs = {};

router.post("/register/:correctID", (req, res) => {
  let newID,
    key = String(Math.random()).replace(".", ""); // no purpose to remove the . but like it's prettier

  while (guessIDs[newID] || !newID) {
    newID = makeid(4);
  }

  guessIDs[newID] = {
    key,
    green: 0,
    yellow: 0,
    red: 0,
    revisions: 0,
    got: [],
    correct: Number(req.params.correctID),
    timeout: setTimeout(() => {
      delete guessIDs[newID];
    }, 30_000),
  };

  res.send({
    id: newID,
    key,
  });
});

router.patch("/:guessID/:key/:correctID", (req, res) => {
  const id = req.params.guessID;

  if (!guessIDs[id]) {
    res.status(400).send(`Doesn't exist`);
    return;
  }
  if (guessIDs[id].key !== req.params.key) {
    res.status(400).send(`Wrong key`);
    return;
  }

  guessIDs[id].correct = Number(req.params.correctID);
  guessIDs[id].revisions++;
  guessIDs[id].green = 0;
  guessIDs[id].yellow = 0;
  guessIDs[id].red = 0;
  guessIDs[id].got = [];

  res.send(`Done`);
});

router.get("/details/:guessID", (req, res) => {
  const id = req.params.guessID;

  if (!guessIDs[id]) {
    res.status(400).send(`Doesn't exist`);
    return;
  }

  // refresh timeout
  clearTimeout(guessIDs[id].timeout);
  guessIDs[id].timeout = setTimeout(() => {
    delete guessIDs[id];
  }, 30_000);

  res.send({
    ...guessIDs[id],
    timeout: null,
    key: null,
    got: null,
  });
});

router.get("/:guessID", (req, res) => {
  const id = req.params.guessID;

  if (!guessIDs[id]) {
    res.status(400).redirect("/huh.mp4");
    return;
  }

  res.render(`ponldeAudience`, {
    correct: guessIDs[id].correct,
    id,
    track: Object.values(tracks).find((a) => a.id === guessIDs[id].correct),
  });
});

router.post("/got/:guessID/:n", (req, res) => {
  const id = req.params.guessID;

  if (!guessIDs[id]) {
    res.status(400).send(`Doesn't exist`);
    return;
  }

  if (guessIDs[id].got.includes(req.clientIp)) {
    res.status(400).send(`You already guessed`);
    return;
  }

  guessIDs[id].got.push(req.clientIp);

  if (req.params.n === "green") {
    guessIDs[id].green++;
  } else if (req.params.n === "yellow") {
    guessIDs[id].yellow++;
  } else {
    guessIDs[id].red++;
  }
});

module.exports = router;
