window.toLoad++;

document.addEventListener(`DOMContentLoaded`, () => {
  const allArchives = [...document.querySelectorAll(`.songIndicators`)];

  for (let i = 0; i < allArchives.length; i++) {
    const element = allArchives[i];
    const runID = element.getAttribute(`data-localstore-id`);
    const data = localStorage.getItem(runID);
    const indicators = [];

    let score = 0;

    const parsed = data ? JSON.parse(data) : {tracks:[]};

    for (
      let ii = Number(element.getAttribute(`indicator-amount`)) - 1;
      ii > -1;
      ii--
    ) {
      const indicator = document.createElement(`div`);
      indicator.classList.add(`indicator`);
      indicators.push(indicator);

      if (!parsed.tracks[ii]) {
        element.prepend(indicator)
        continue;
      };

      const guesses = parsed.tracks[ii].guesses;

      if (!guesses[0]) continue;

      let best = "";

      for (let iii = 0; iii < 3; iii++) {
        if (guesses[iii] == "green") {
          score += 1;
          best = "green";
        } else if (guesses[iii] == "yellow") {
          score += 0.5;
          best = "yellow";
        } else if (guesses[iii] == "grey") score += 1;
      }

      if (best == "green") indicator.classList.add(`green`);
      else if (best == "yellow") indicator.classList.add(`yellow`);
      else indicator.classList.add(`red`);

      element.prepend(indicator)
    }

    element.querySelector(`.score`).innerText = `${String(Math.round(score * 2)).padStart(2, "0")}/30`;
  }

  window.toLoad--;
});
