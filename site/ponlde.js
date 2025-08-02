const express = require('express')
const router = express.Router()

const gameAPI = require(`../api/game`)

const db = require(`../db/db`)

// Infinites
router.get(`/infinite`, (req, res)=>{
  const gameData = {
    ...gameAPI.getGameData("infinite"),
    copyDescription: "infinite"
  };

  res.render(`ponlde.ejs`, {
    gameData
  })
})

router.get(`/easy/infinite`, (req, res)=>{
  const gameData = {
    ...gameAPI.getGameData("easy"),
    copyDescription: "easy infinite"
  };

  res.render(`ponlde.ejs`, {
    gameData
  })
})

router.get(`/classic`, (req, res)=>{
  const gameData = {
    ...gameAPI.getGameData(""),
    copyDescription: "classic",
    hidden: true
  };

  res.render(`ponlde.ejs`, {
    gameData
  })
})

router.get(`/hardcore`, (req, res)=>{
  const gameData = {
    ...gameAPI.getGameData("hard"),
    copyDescription: "🤓 hardcore",
    hardcore: true
  };

  res.render(`ponlde.ejs`, {
    gameData
  })
})

router.get(`/oneshot`, (req, res)=>{
  const gameData = {
    ...gameAPI.getGameData(),
    copyDescription: "💡 oneshot",
    oneshot: true
  };

  res.render(`ponlde.ejs`, {
    gameData
  })
})

router.get(`/lodestar`, (req, res)=>{
  const gameData = {
    ...gameAPI.getGameData("hard"),
    copyDescription: "🌠 LODESTAR",
    hidden: true,
    oneshot: true,
    hardcore: true
  };

  res.render(`ponlde.ejs`, {
    gameData
  })
})

// Dailies
router.get(`/daily`, (req, res)=>{
  const mostRecent = db.days().chain().find({ mode: "normal" }).sort((a,b)=>b.day-a.day).limit(1).data()[0]

  const gameData = {
    ...mostRecent.data,
    copyDescription: `daily ${mostRecent.date}`
  };

  res.render(`ponlde.ejs`, {
    gameData
  })
})

router.get(`/easy`, (req, res)=>{
  const mostRecent = db.days().chain().find({ mode: "easy" }).sort((a,b)=>b.day-a.day).limit(1).data()[0]

  const gameData = {
    ...mostRecent.data,
    copyDescription: `daily easy ${mostRecent.date}`
  };

  res.render(`ponlde.ejs`, {
    gameData
  })
})

// Archives
router.get(`/archive/:date/:mode`, (req, res)=>{
  const found = db.days().findOne({ mode: "normal", date: req.params.date, mode: req.params.mode });

  if(!found) {
    res.status(404).render(`404`)
    return;
  }

  const copyDescription = found.mode == "easy" ? `daily easy ${found.date}` : `daily ${found.date}` 

  const gameData = {
    ...found.data,
    copyDescription
  };

  res.render(`ponlde.ejs`, {
    gameData
  })
})

module.exports = router
