const { fork } = require('child_process');

function process() {
  fork("../webpunk/webpunker.js", {
    cwd: "../webpunk/"
  })
}

setInterval(process, 6 * 60 *  60 * 1000) // every 6h, automatically adds new songs and albums

//process();