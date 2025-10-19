// PLEASE DON'T KILL ME PLEASE DON'T KILL ME PLEASE DON'T KILL ME
// i just need to read messages it's soooo funny please

require(`dotenv`).config();
const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

const express = require("express");
const router = express.Router();

const HASHTAGCHAT = "1127198607263666206";
const VYLETID = "149735968142917632"

// Testing
//const VYLETID = ""
//const HASHTAGCHAT = "";

let lastMessage = ["", "0"]

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
})

client.on("messageCreate", (msg)=>{
  if(msg.channelId !== HASHTAGCHAT || msg.author.bot || msg.author.id !== VYLETID) return;

  lastMessage = [msg.content, msg.id]
})

client.login(process.env.DISCORD_TOKEN);

router.get(`/last`, (_, res)=>{
  res.send(lastMessage)
})

module.exports = router;