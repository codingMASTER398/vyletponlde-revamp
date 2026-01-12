const hey = new Audio(`/audio/hey.ogg`)

setInterval(()=>{
  if(Math.random() < 0.9997) return;
  hey.play();
}, 1_000)