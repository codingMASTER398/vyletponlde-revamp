const express = require("express");
const router = express.Router();

const LiveChat = require("@freetube/youtube-chat").LiveChat;

// coding398: UC3B7Nd8qzdcULkVQ3pg5zfQ ( qyo3lDLOhrA )
// vylet: UCDnYX2jqzQXMST8Yo4NzQZQ

let last5 = [];

async function doLiveChat() {
  const liveChat = new LiveChat({
    channelId: "UCDnYX2jqzQXMST8Yo4NzQZQ",
    //liveId: "qyo3lDLOhrA",
  });

  last5 = [];

  liveChat.on("start", (liveId) => {
    console.log(`Connected to chat`)
  });

  liveChat.on("end", (reason) => {
    console.log(`Stream ended: ${reason}`)

    setTimeout(() => {
      doLiveChat();
    }, 30_000);
  });

  liveChat.on("comment", (comment) => {
    last5.push({
      user: comment?.author?.name || "uhm idk",
      text: comment?.message?.[0]?.text || "???",
    });

    if(last5.length > 5) last5.shift();
  });

  liveChat.on("error", (err) => {});

  try {
    await liveChat.start();

    console.log("Stream on!");
  } catch (e) {
    console.log(`Stream not on yet...`);

    setTimeout(() => {
      doLiveChat();
    }, 30_000);
  }
}

doLiveChat();

router.get(`/last5`, (_, res)=>{
  res.send(last5)
})

module.exports = router;