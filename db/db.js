const loki = require("lokijs");
const db = new loki("../db/ponlde.db", {
  autosave: true,
  autosaveInterval: 4000,
  autoload: true,
  autoloadCallback: databaseInitialize,
});

const gameAPI = require(`../api/game`);

let days;

function databaseInitialize() {
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
      date: `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
      day: today,
    };

    days.insertOne({
      ...baseData,
      mode: "normal",
      data: gameAPI.getGameData("normal"),
    });

    days.insertOne({
      ...baseData,
      mode: "easy",
      data: gameAPI.getGameData("easy"),
    });

    lastDay.day = today;
    _lastDay.update(lastDay);
  }, 1000);
}

module.exports = {
  days: ()=>days,
};
