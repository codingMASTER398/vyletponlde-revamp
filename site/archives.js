const express = require("express");
const router = express.Router();

const db = require(`../db/db`);

function generateRunID(data) {
  return (
    (data.data.tracks[0].id + "-") +
    (data.data.tracks[1].id + "-") +
    (data.data.tracks[2].id + "-") +
    (data.data.tracks[3].id + "-") +
    data.data.tracks[4].id
  );
}

router.get("/", (req, res) => {
  res.render(`archive`, {
    data: db.days().find({
      mode: "normal",
    }).reverse(),
    archiveDescription: "normal",
    generateRunID,
  });
});

router.get("/easy", (req, res) => {
  res.render(`archive`, {
    data: db.days().find({
      mode: "easy",
    }).reverse(),
    archiveDescription: "easy",
    generateRunID,
  });
});

module.exports = router;
