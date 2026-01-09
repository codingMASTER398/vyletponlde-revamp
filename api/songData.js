const express = require("express");
const router = express.Router();

const tracks = require(`../util/tracks`)

router.get("/autocomplete", (req, res)=>{
  res.set('Cache-Control', 'public, max-age=3600000');
  res.send(Object.values(tracks).filter((track)=>!track.isFeatherSong).map((track)=>{
    return {
      n: track.title,
      a: track.acronyms,
      id: track.id,
      al: track.album
    }
  }))
})


router.get("/autocomplete-feather", (req, res)=>{
  res.set('Cache-Control', 'public, max-age=3600000');
  res.send(Object.values(tracks).filter((track)=>track.isFeatherSong).map((track)=>{
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

router.use(`/thumbnail`, express.static(`../webpunk-feather/data/albumImages`, {
  maxAge: 360000,
  immutable: true,
}))

router.use(`/trackart`, express.static(`../webpunk/art/processed`, {
  maxAge: 360000,
  immutable: true,
}))

router.use(`/waveform`, express.static(`../webpunk/data/waveforms`, {
  maxAge: 360000,
  immutable: true,
}))

module.exports = router;
