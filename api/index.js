const express = require('express')
const router = express.Router()

router.use('/audio', require(`./audio`))
router.use('/songData', require(`./songData`))
router.use('/game', require(`./game`).router)

module.exports = router
