const express = require('express')
const router = express.Router()

const db = require(`../db/db`)

router.get("/", (req, res)=>{
  res.render(`archive`, {
    data: db.days().find({
      mode: "normal"
    }),
    archiveDescription: "normal"
  })
})

router.get("/easy", (req, res)=>{
  console.log(1)

  res.render(`archive`, {
    data: db.days().find({
      mode: "easy"
    }),
    archiveDescription: "easy"
  })
})

module.exports = router
