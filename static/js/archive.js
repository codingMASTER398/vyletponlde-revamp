window.toLoad++;

document.addEventListener(`DOMContentLoaded`, ()=>{
  const allArchives = [...document.querySelectorAll(`.songIndicators`)];

  for (let i = 0; i < allArchives.length; i++) {
    const element = allArchives[i];
    const runID = element.getAttribute(`data-localstore-id`);
    const data = localStorage.getItem(runID);
    const indicators = [...element.querySelectorAll(`.indicator`)];

    let score = 0;

    if(!data) continue;

    const parsed = JSON.parse(data);

    for (let ii = 0; ii < indicators.length; ii++) {
      const indicator = indicators[ii],
        guesses = parsed.tracks[ii].guesses;

      if(!guesses[0]) continue;

      let best = ""
      
      for (let iii = 0; iii < 3; iii++) {
        if(guesses[iii] == "green") {
          score += 1;
          best = "green"
        } else if(guesses[iii] == "yellow") {
          score += 0.5;
          best = "yellow"
        } else if(guesses[iii] == "grey") score += 1;
      }

      if(best == "green") indicator.classList.add(`green`);
      else if(best == "yellow") indicator.classList.add(`yellow`);
      else indicator.classList.add(`red`);
    }

    element.querySelector(`.score`).innerText = `${String(score).padStart(2, "0")}/15`
  }

  window.toLoad--;
})