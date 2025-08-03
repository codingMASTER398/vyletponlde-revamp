const loki = require("lokijs");
const db = new loki("../db/ponlde.db", {
  autosave: true,
  autosaveInterval: 4000,
  autoload: true,
  autoloadCallback: databaseInitialize,
});

const gameAPI = require(`../api/game`);

let days, leaderboard;

function databaseInitialize() {
  leaderboard = db.addCollection("leaderboard");
  days = db.addCollection("days");
  _lastDay = db.addCollection("lastDay");

  //days.removeWhere({});
  //_lastDay.removeWhere({});

  if (!_lastDay.findOne({})) {
    _lastDay.insertOne({
      day: -1,
    });
  }

  setInterval(() => {
    const lastDay = _lastDay.findOne({});
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

    if (lastDay.day == today) return;

    // it's a brand new day again, still feels like yesterday.
    console.log(`New day!`);

    const baseData = {
      date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate() + 1).padStart(2, "0")}`,
      day: today,
    };

    days.insertOne({
      ...baseData,
      mode: "normal",
      data: gameAPI.getGameData("normal"),
    });

    leaderboard.insertOne({
      date: baseData.date,
      mode: "normal",
      scores: []
    })

    days.insertOne({
      ...baseData,
      mode: "easy",
      data: gameAPI.getGameData("easy"),
    });

    leaderboard.insertOne({
      date: baseData.date,
      mode: "easy",
      scores: []
    })

    lastDay.day = today;
    _lastDay.update(lastDay);
  }, 1000);

  const allDays = days.find({})
  for (let i = 0; i < allDays.length; i++) {
    let day = allDays[i];

    if(day.date == "2025-08-03") {
      day.date = "2025-08-02"
      days.update(day)
    }
    if(day.date == "2025-08-04") {
      day.date = "2025-08-03"
      days.update(day)
    }
    
    if(leaderboard.findOne({
      date: day.date,
      mode: day.mode
    })) return;

    leaderboard.insertOne({
      date: day.date,
      mode: day.mode,
      scores: []
    })
  }
}

module.exports = {
  days: ()=>days,
  leaderboard: ()=>leaderboard
};
