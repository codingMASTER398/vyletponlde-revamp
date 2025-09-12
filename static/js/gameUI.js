function createGuessWrapper(footerText, className, disabled) {
  const guessWrapper = document.createElement(`div`);
  guessWrapper.classList.add(`guessWrapper`);
  guessWrapper.classList.add(className);
  if (disabled) guessWrapper.setAttribute(`disabled`, true);

  const progressWrapper = document.createElement(`div`);
  progressWrapper.classList.add(`progress`);

  const progressFull = document.createElement(`div`);
  progressFull.classList.add(`full`);
  progressFull.style.width = "0";

  const guessContent = document.createElement(`div`);
  guessContent.classList.add(`guessContent`);

  const buttonsWrapper = document.createElement(`div`);
  buttonsWrapper.classList.add(`buttons`);

  const playButton = document.createElement(`button`);
  playButton.classList.add(`playButton`);

  const playButtonIcon = document.createElement(`img`);
  playButtonIcon.src = "/img/playIcon.png";

  const skipButton = document.createElement(`button`);
  skipButton.classList.add(`skipButton`);

  const skipButtonIcon = document.createElement(`img`);
  skipButtonIcon.src = "/img/skipIcon.png";

  const guessRight = document.createElement(`div`);
  guessRight.classList.add(`guessRight`);

  const guessInput = document.createElement(`input`);
  guessInput.classList.add(`guessInput`);
  guessInput.placeholder = "guess a song";
  (guessContent.setAttribute("type", "text"),
    guessContent.setAttribute(`autocomplete`, `off`));

  const resultBox = document.createElement(`div`);
  resultBox.classList.add(`resultBox`);
  resultBox.style.display = "none";

  const resultBoxP = document.createElement(`p`);

  const footerP = document.createElement(`p`);
  footerP.innerText = footerText;

  resultBox.appendChild(resultBoxP);
  guessRight.appendChild(guessInput);
  guessRight.appendChild(resultBox);
  guessRight.appendChild(footerP);

  playButton.appendChild(playButtonIcon);
  skipButton.appendChild(skipButtonIcon);

  buttonsWrapper.appendChild(playButton);
  buttonsWrapper.appendChild(skipButton);

  guessContent.appendChild(buttonsWrapper);
  guessContent.appendChild(guessRight);

  progressWrapper.appendChild(progressFull);

  guessWrapper.appendChild(progressWrapper);
  guessWrapper.appendChild(guessContent);

  return guessWrapper;
}

function showRoundEndInfo(title, album, imageId, bandcamp) {
  document.querySelector(`.roundEnd`).classList.add(`in`);

  document.querySelector(`.roundEnd img`).src =
    `/api/songData/thumbnail/${imageId}.jpg`;
  document.querySelector(`.roundEnd h2`).innerText = title;
  document.querySelector(`.roundEnd p`).innerText = album;
  document.querySelector(`.roundEnd a`).href = bandcamp;
}

// stackoverflow code
function fallbackCopyTextToClipboard(text) {
  let textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    let successful = document.execCommand("copy");
    let msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
}
// end stackoverflow :3

function endGameUI() {
  // Calculate score. Calculated from 0-15, but rendered 0-30
  let correct = 0,
    score = 0;

  for (let i = 0; i < gameState.tracks.length; i++) {
    const track = gameState.tracks[i];
    const element = document.querySelector(`.resultsList`).children[i];

    element.querySelector(`img`).src =
      `/api/songData/thumbnail/${track.image}.jpg`;
    element.querySelector(`a`).innerText = track.title;
    element.querySelector(`a`).href =
      "https://vyletpony.bandcamp.com/" + window.gameData.tracks[i].bandcamp;

    if (track.guesses.includes("green")) correct++;

    for (let ii = 0; ii < track.guesses.length; ii++) {
      const value = track.guesses[ii] || "grey";
      const indicator = element.querySelector(`.indicators`).children[ii];

      indicator.classList.add(value);
      indicator.setAttribute(`title`, track.userGuess[ii] || "N/A");

      if (value == "green" || value == "grey") score += 1;
      else if (value == "yellow") score += 0.5;
    }
  }

  // Calculate grade
  let grade = `F`;
  if (score >= 1) grade = "E-";
  if (score >= 2) grade = "E";
  if (score >= 3) grade = "E+";
  if (score >= 4) grade = "D-";
  if (score >= 5) grade = "D";
  if (score >= 6) grade = "D+";
  if (score >= 7) grade = "C-";
  if (score >= 8) grade = "C";
  if (score >= 9) grade = "C+";
  if (score >= 10) grade = "B-";
  if (score >= 11) grade = "B";
  if (score >= 12) grade = "B+";
  if (score >= 13) grade = "A-";
  if (score >= 14) grade = "A";
  if (score == 15) grade = "A+";

  if (score >= 15) confettiWinBig();
  if (score >= 10) confettiWin();

  // Texts
  document.querySelector(`.gameArea`).style.display = "none";
  document.querySelector(`.fullEnd`).style.display = "";
  document.querySelector(`.fullEnd`).classList.add(`in`);
  document.querySelector(`.correctValue`).innerText = `${correct}/5`;
  document.querySelector(`.scoreValue`).innerText =
    `${Math.round(score * 2)}/30`;
  document.querySelector(`.gradeValue`).innerText = grade;

  // Win streak
  if(correct === 5) {
    if(!window.noIncreaseWinStreak) localStorage.setItem(`winStreak`, Number(localStorage.getItem(`winStreak`) || 0) + 1)
  } else localStorage.setItem(`winStreak`, `0`)

  document.querySelector(`.winStreak`).innerText = `5/5 streak: ${localStorage.getItem(`winStreak`)}`

  // Buttons
  document.querySelector(`.homeButton`).addEventListener(`click`, () => {
    clickSound();
    window.location.href = "/";
  });

  document.querySelector(`.shareButton`).addEventListener(`click`, () => {
    // Get the share copy description
    let text = `${window.gameData.copyDescription}\nscore: ${Math.round(score * 2)}/30, ${grade}`;

    for (let i = 0; i < gameState.tracks.length; i++) {
      const track = gameState.tracks[i];

      text += "\n";

      for (let ii = 0; ii < track.guesses.length; ii++) {
        const value = track.guesses[ii] || "grey";
        text += {
          green: "🟩",
          yellow: "🟨",
          red: "🟥",
          grey: "⬛",
        }[value];
      }
    }

    text += `\n${window.location.href} (revamp)`;

    copyTextToClipboard(text);
    clickSound();

    document.querySelector(`.copiedToClipboard`).classList.add(`exists`);
  });

  // Uh
  if(!window.gameData.vylet && window.gameData.lodestar && score == 15) {
    document.querySelector(`.vyletMode`).style.display = ""
    document.querySelector(`.vyletMode`).addEventListener(`click`, ()=>{
      window.location.href = '/creekflowCaptcha'
    })
  }

  // Leaderboard
  const lbButton = document.querySelector(`.leaderboardButton`);

  if (!lbButton) return;

  lbButton.addEventListener(`click`, async () => {
    lbButton.classList.add(`disabled`);

    clickSound();

    const name = document.querySelector(`.lbNick`).value;
    if (name.length != 5) {
      alert(`Nick must be 5 characters long!`);
      lbButton.classList.remove(`disabled`);
      return;
    }

    const response = await fetch(
      lbButton
        .getAttribute(`data-url`)
        .replace(`%score`, score)
        .replace(`%name`, name),
      {
        method: "POST",
      }
    );

    if (response.status != 200) {
      alert(await response.text());
      lbButton.classList.remove(`disabled`);
      return;
    }

    document.querySelector(`.leaderboardContent`).innerHTML =
      await response.text();

    const squee = new Audio(`/audio/squee.ogg`);
    squee.volume = window.volume;
    squee.play();

    lbButton.innerText = `Added`;
  });
}

// confetti
function confettiCorrect() {
  if (settings.hideConfetti.enabled) return;

  confetti({
    particleCount: 50,
    spread: 100,
    origin: { y: 0.5 },
  });
}

function confettiWin() {
  if (!settings.hideConfetti.enabled) {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      decay: 0.95,
      ticks: 500,
    });
  }

  if (!settings.noLoudSounds.enabled) {
    const squee = new Audio(`/audio/squee.ogg`);
    squee.volume = window.volume;
    squee.play();
  }
}

function confettiWinBig() {
  if (!settings.hideConfetti.enabled) {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.5 },
      decay: 0.95,
      ticks: 900,
      shapes: [confetti.shapeFromText({ text: "🦄", scalar: 2 })],
      scalar: 5,
    });
  }

  if (!settings.noLoudSounds.enabled) {
    const yay = new Audio(`/audio/yay.ogg`);
    yay.volume = window.volume;
    yay.play();
  }
}
