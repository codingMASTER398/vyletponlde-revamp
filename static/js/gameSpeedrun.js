let gameState = {
    tracks: [],
    currentTrack: 0,
    currentGuess: 0,
  },
  currentlyPlaying = false,
  audioStopShift = 0,
  trackAudio = [];

window.toLoad++;

const clicky = new Audio("/audio/click.ogg");

function clickSound() {
  clicky.volume = window.volume;
  clicky.play();
}

function stopAudio() {
  audioStopShift++;
}

function lyricCensor(lyric, factor) {
  const splitAt = Math.round(lyric.length * factor);
  const shown = lyric.substr(0, splitAt);
  const hidden = lyric.substr(splitAt, lyric.length);

  return `${shown}<span class="hidden">${hidden}</span>`;
}

function setupAutoComplete(element) {
  // Sets up the autocomplete box & registers inputs
  const inputBox = element.querySelector(`input`);
  const resultBox = element.querySelector(`.resultBox`);

  let onEnter, disabled;

  resultBox.addEventListener(`click`, () => {
    const result = miniSearch.search(inputBox.value, { fuzzy: 0.2 })[0];
    if (result) inputBox.value = result.n;
    inputBox.focus();
  });

  const autoComplete = (e) => {
    if (disabled) return;

    const result = miniSearch.search(inputBox.value, { fuzzy: 0.2 })[0];

    if (e.key == "Enter" && result?.id) {
      onEnter(result.id, result.n, result.al);
      return;
    }

    if (!result) {
      // hide the result box here;
      resultBox.style.display = "none";
      return;
    }

    resultBox.querySelector(`p`).innerText = `> ` + result.n;
    resultBox.style.display = "block";
    resultBox.classList.remove(`incorrect`);
  };

  inputBox.addEventListener(`keydown`, autoComplete);
  inputBox.addEventListener(`input`, autoComplete);

  return {
    onEnter: (f) => {
      onEnter = f;
    },
    disable: () => {
      disabled = true;
      inputBox.blur();
    },
  };
}

async function loadGameState() {
  // uhh how tf am i gonna do this
  startNewRound();

  // this function is useless but ill keep it for laughs
}

function loadTrackAudio(trackNum, data) {
  let loader = false;
  if (window.toLoad > 0) {
    window.toLoad++;
    loader = true;
  }

  trackAudio[trackNum] ??= {};

  // Edge case for archives before 8/4/25
  if (!data.audio.endsWith(`.ogg.ogg`)) data.audio += `.ogg`; // dual weild

  trackAudio[trackNum].base = new Audio(`/api/audio/base/${data.audio}`);

  trackAudio[trackNum].base.addEventListener(`canplaythrough`, () => {
    if (loader) window.toLoad--;
  });
}

async function startNewRound() {
  const autoComplete = setupAutoComplete(
    document.querySelector(`.songGuessList`)
  );
  const guessInput = document.querySelector(`.songGuessList input`),
    guessResult = document.querySelector(`.songGuessList .resultBox`),
    timerElem = document.querySelector(`.timer`);

  let audio,
    currentTrackData,
    currentTrackNum,
    timer = 60,
    timerInterval,
    stopAudioTimeout;

  const startNextTrack = () => {
    ((currentTrackData = window.gameData.tracks[gameState.currentTrack]),
      (currentTrackNum = gameState.currentTrack));

    audio?.pause?.();
    clearTimeout(stopAudioTimeout);

    audio = trackAudio[currentTrackNum].base;

    audio.play();
    audio.volume = window.volume;
    audio.currentTime = 1;

    guessInput.value = "";
    guessResult.style.display = "none";

    stopAudioTimeout = setTimeout(() => {
      audio?.pause?.();
    }, 8_000);
  };

  // Wait for the first click then BEGIN!
  guessInput.addEventListener(
    `click`,
    () => {
      startNextTrack();
      timerInterval = setInterval(() => {
        timer -= 0.1;
        timer = Number(timer.toFixed(1));
        timerElem.innerText = `⏰ ${timer.toFixed(1)}s`;

        if ((timer + 0.1) % 1 === 0) {
          timerElem.classList.remove(`bounce`);
          timerElem.offsetWidth;
          timerElem.classList.add(`bounce`);
        }

        if (timer === 0) {
          autoComplete.disable();
          clearInterval(timerInterval);
          endGameUI();
          return;
        }

        const toYellow =
          window.gameData.amountOverride -
          timer / (60 / window.gameData.amountOverride);

        document
          .querySelector(`.songIndicators`)
          .children[toYellow].classList.add(`yellow`);
      }, 1_00);
    },
    { once: true }
  );

  autoComplete.onEnter((f) => {
    if (f === currentTrackData.id) {
      // Correct, next song!
      document
        .querySelector(`.songIndicators`)
        .children[currentTrackNum + 1].classList.add(`green`);

      gameState.tracks.push({
        guesses: ["green"],
      });
      gameState.currentTrack++;

      if (gameState.currentTrack >= window.gameData.tracks.length) {
        // did it!!! woohooooo
        clearInterval(timerInterval);
        endGameUI();
        audio?.pause?.();
      }

      guessInput.classList.remove(`greenFlash`);
      guessInput.offsetWidth;
      guessInput.classList.add(`greenFlash`);

      startNextTrack();
    } else {
      // Show a little red incorrect thing
      guessResult.classList.add(`incorrect`);
    }
  });
}

document.addEventListener(`DOMContentLoaded`, async () => {
  gameState.currentTrack = 0;

  // Get autocomplete data
  const autocompleteData = await (
    await fetch("/api/songData/autocomplete")
  ).json();

  window.autocompleteData = autocompleteData;

  let miniSearch = new MiniSearch({
    fields: ["n", "a"],
    storeFields: ["n", "id", "al"],

    extractField: (document, fieldName) => {
      if (Array.isArray(document[fieldName])) {
        return document[fieldName].join(" ");
      } else {
        return document[fieldName];
      }
    },
  });

  // Index all documents
  miniSearch.addAll(autocompleteData);
  window.miniSearch = miniSearch;

  // Load the game state
  loadGameState();

  // Preload EVERYTHING
  for (let i = 0; i < window.gameData.tracks.length; i++) {
    loadTrackAudio(i, window.gameData.tracks[i]);
  }

  window.toLoad--;
});
