const express = require("express");
const router = express.Router();

const tracks = require(`../util/tracks`)

router.get("/autocomplete", (req, res)=>{
  res.send(Object.values(tracks).map((track)=>{
    return {
      n: track.title,
      a: track.acronyms,
      id: track.id,
      al: track.album
    }
  }))
})

router.use(`/thumbnail`, express.static(`../webpunk/data/albumImages`, {
  maxAge: 360000,
  immutable: true,
}))

module.exports = router;
