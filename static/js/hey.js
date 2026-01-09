const hey = new Audio(`/audio/hey.ogg`)

setInterval(()=>{
  if(Math.random() < 0.9985) return;
  hey.play();
}, 1_000)