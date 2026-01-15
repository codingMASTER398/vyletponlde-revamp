const badwordFiltered = require(`./badwordFilter`);
const express = require("express");
const router = express.Router();

const db = require(`../db/db`);

function canSubmitToLB(req, dbData) {
  if (dbData.scores.find((score) => score.ip == req.clientIp)) return false;
  return true;
}

function dailyData(req, date, mode) {
  // Let's make sure to not leak any IPs here
  const dbData = db.leaderboard().findOne({
    date,
    mode,
  });

  return {
    users: dbData.scores.sort((a,b)=>b.score - a.score).map((d) => {
      return `${d.name} ${Math.round(d.score * 2)}/30`;
    }),
    canSubmit: canSubmitToLB(req, dbData),
    submitURL: `/api/leaderboard/${date}/${mode}/%score/%name`,
  };
}

// Why bother with a request body when you can do it all with params?
router.post(`/:date/:mode/:score/:name`, (req, res) => {
  let { date, mode, score, name } = req.params;

  score = Number(Number(score).toFixed(1));
  name = name.replace(/[^A-Z0-9]+/g, "");

  if (
    score < 0 ||
    score > 15 ||
    name.length != 5 ||
    !["normal", "easy", "lyric", "art", "waveform"].includes(mode)
  ) {
    res.status(400).send(`Invalid data`);
    return;
  }

  let dbData = db.leaderboard().findOne({
    date,
    mode,
  });

  if (!dbData) {
    res.status(400).send(`Invalid date`);
    return;
  }

  if (!canSubmitToLB(req, dbData)) {
    res.status(400).send(`Already submitted from same IP`);
    return;
  }

  if (badwordFiltered(name)) {
    res.status(400).send(`Blasphemy`);
    return;
  }

  if (dbData.scores.find((s) => s.name) == name) {
    res.status(400).send(`Someone already submitted under "${name}"!`);
    return;
  }

  dbData.scores.push({
    name,
    score,
    ip: req.clientIp,
  });

  db.leaderboard().update(dbData);

  res.status(200).render(`blocks/leaderboardContent`, {
    lb: {
      users: dbData.scores.sort((a,b)=>b.score - a.score).map((d) => {
        return `${d.name} ${Math.round(d.score * 2)}/30`;
      }),
    },
  });
});

module.exports = {
  canSubmitToLB,
  dailyData,
  router,
};
