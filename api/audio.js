const express = require("express");
const router = express.Router();

router.use(express.static(`../webpunk/data/bits`, {
  maxAge: 360000,
  immutable: true,
}))

module.exports = router;
