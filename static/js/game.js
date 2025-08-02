let gameState = {
    tracks: [],
    currentTrack: 0,
    currentGuess: 0,
  },
  trackAudio = [],
  currentlyPlaying = false,
  audioStopShift = 0;

// playTrack(trackAudio[0], 0, 10)
// playTrack(trackAudio[0], 10, 12.9)
// playTrack(trackAudio[0], 13, 13.9)
// playTrack(trackAudio[0], 14, 14.5)

const clicky = new Audio("/audio/click.ogg");

function stopAudio() {
  audioStopShift++;
}

function playTrack(audio, from, to, element, disableOtherPlays = true) {
  // Play a part of a track chunk. Stops all other tracks from playing.
  if (disableOtherPlays) currentlyPlaying = true;

  audio = audio.cloneNode();
  stopAudio();

  const progress = element?.querySelector?.(`.progress .full`),
    playButton = element?.querySelector?.(`.playButton`);

  if (element) {
    playButton.disabled = true;
    progress.classList.remove(`t`);
    progress.classList.remove(`out`);
    progress.style.width = "0%";
    progress.offsetWidth;
    progress.classList.add(`t`);
  }

  audio.play();
  audio.volume = window.volume;
  audio.currentTime = from;

  let currentShift = Number(audioStopShift);

  let checkInterval = setInterval(() => {
    if (
      audio.currentTime >= to - 0.05 ||
      audioStopShift != currentShift ||
      audio.paused
    ) {
      audio.pause();
      clearInterval(checkInterval);

      if (disableOtherPlays) currentlyPlaying = false;
      if (!element) return;

      playButton.disabled = false;
      progress.style.width = `100%`;
      progress.classList.add(`out`);
      return;
    } else if (element) {
      progress.style.width = `${(((audio.currentTime - from) / (to - from)) * 100).toFixed(2)}%`;
    }

    audio.volume = window.volume;
  }, 1);
}

function setupAutoComplete(element) {
  // Sets up the autocomplete box & registers inputs
  const inputBox = element.querySelector(`input`);
  const resultBox = element.querySelector(`.resultBox`);

  let onEnter, disabled;

  inputBox.addEventListener(`keyup`, (e) => {
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
  });

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

function setupGuesser(data) {
  // Sets up the guessing logic for a guessWrapper object
  return new Promise((r) => {
    const { className, start, end, audio, correctId, correctAlbum } = data;
    const element = document.querySelector(`.${className}`);
    const input = setupAutoComplete(element.querySelector(`.guessRight`));

    element.removeAttribute(`disabled`);

    let done = false;

    const makeYellowRedGreen = (color) => {
      input.disable();
      element.classList.add(color);
      element.classList.add(`done`);
      done = true;
    };

    element.querySelector(`.playButton`).addEventListener(`click`, () => {
      if (!currentlyPlaying) playTrack(audio, start, end, element);
    });

    element.querySelector(`.skipButton`).addEventListener(`click`, () => {
      if (done) return;
      clicky.volume = window.volume;
      clicky.play();
      element.querySelector(`.resultBox`).style.display = "none";
      element.querySelector(`input`).value = "Skipped";
      makeYellowRedGreen("red");
      r({ input: "Skipped" });
    });

    input.onEnter((id, title, album) => {
      element.querySelector(`.resultBox`).style.display = "none";
      element.querySelector(`input`).value = title;

      if (correctId == id) {
        makeYellowRedGreen("green");
        r({
          isCorrect: true,
          input: title
        });
        return;
      } else if (album == correctAlbum && !window.gameData.hidden) {
        makeYellowRedGreen("yellow");
        r({ isYellow: true, input: title });
      } else {
        makeYellowRedGreen("red");
        r({ input: title });
      }
    });

    if (data.color) {
      // Already filled
      makeYellowRedGreen(data.color);
      element.querySelector(`input`).value = data.userGuess;
      r({ isCorrect: data.color == "green", isYellow: data.color == "yellow", input: data.userGuess });
    } else if (data.hadCorrect) {
      // One above was correct, just return with grey
      makeYellowRedGreen("alreadyAbove");
      r({
        isCorrect: true,
        input: ""
      });
    }
  });
}

async function loadGameState() {
  // uhh how tf am i gonna do this
  startNewRound();
}

async function startNewRound() {
  // Clean up old data
  document.querySelector(`.roundEnd`).classList.remove(`in`);
  document.querySelector(`.songGuessList`).innerHTML = ``;

  // Then uh get the new data!!!
  const currentTrackData = window.gameData.tracks[gameState.currentTrack],
    currentTrackNum = gameState.currentTrack;

  if (!trackAudio[currentTrackNum]) {
    // Load track audio
    trackAudio[currentTrackNum] = new Audio(currentTrackData.audio);

    // Preload the next track
    if (window.gameData.tracks[gameState.currentTrack + 1]) {
      // lolololololololol
      trackAudio[currentTrackNum + 1] = new Audio(
        window.gameData.tracks[gameState.currentTrack + 1].audio
      );
    }

    if (window.toLoad > 0) {
      // Page is still loading
      trackAudio[currentTrackNum].addEventListener(`canplaythrough`, () => {
        window.toLoad--;
      });
    }
  }

  gameState.tracks[currentTrackNum] ??= {
    guesses: [],
    userGuess: [],
    image: currentTrackData.image,
    title: currentTrackData.title,
  };

  createGuessWrappers();

  let result,
    ended = false,
    best = "red";

  const end = () => {
    // When they got it right or ALL WRONG.
    if (ended) return;
    ended = true;

    stopAudio();

    setTimeout(() => {
      // Play a 10s preview of the track
      playTrack(trackAudio[currentTrackNum], 0, 10, false, false);
    }, 100);

    // Show the end track info
    showRoundEndInfo(
      currentTrackData.title,
      currentTrackData.album,
      currentTrackData.image,
      "https://vyletpony.bandcamp.com/" + currentTrackData.bandcamp
    );

    // Change the color of the indicators
    document
      .querySelector(`.songIndicators`)
      .children[currentTrackNum + 1].classList.add(best);

    // If it's oneshot, then one shot the the one shot.

    if (window.gameData.oneshot && best != "green") {
      gameState.currentTrack = 4;
    }

    // Yeah.
    if (gameState.currentTrack == 4) {
      document.querySelector(`.nextButton`).innerText = "show results";
    }

    document.querySelector(`.nextButton`).addEventListener(
      `click`,
      () => {
        clicky.volume = window.volume;
        clicky.play();

        stopAudio();

        if (gameState.currentTrack == 4) {
          endGameUI();
          return;
        }
        gameState.currentTrack++;
        startNewRound();
      },
      {
        once: true,
      }
    );
  };

  const calcBest = (num, guess) => {
    // was meant to like calculate the best red/yellow/green in the run but now it's basically "process result"
    gameState.tracks[currentTrackNum].guesses[num] =
      best == "green"
        ? "grey"
        : result.isCorrect
          ? "green"
          : result.isYellow
            ? "yellow"
            : "red";
    
    gameState.tracks[currentTrackNum].userGuess[num] = guess;

    if (result.isYellow && best == "red") best = "yellow";
    if (result.isCorrect) best = "green";

    pushGameState()
  };

  result = await setupGuesser({
    // Sets it up and waits for the uh user to be done with it
    className: "s05",
    start: 14,
    end: 14.45,
    audio: trackAudio[currentTrackNum],
    correctId: currentTrackData.id,
    correctAlbum: currentTrackData.album,
    hadCorrect: result?.isCorrect,
    color: gameState.tracks[currentTrackNum].guesses[0] || null,
    userGuess: gameState.tracks[currentTrackNum].userGuess[0] || null
  });

  calcBest(0, result.input);
  if (result.isCorrect) end();

  result = await setupGuesser({
    // Sets it up and waits for the uh user to be done with it
    className: "s1",
    start: 13,
    end: window.gameData.hardcore ? 13.4 : 13.9,
    audio: trackAudio[currentTrackNum],
    correctId: currentTrackData.id,
    correctAlbum: currentTrackData.album,
    hadCorrect: result.isCorrect,
    color: gameState.tracks[currentTrackNum].guesses[1] || null,
    userGuess: gameState.tracks[currentTrackNum].userGuess[1] || null
  });

  calcBest(1, result.input);
  if (result.isCorrect) end();

  result = await setupGuesser({
    // Sets it up and waits for the uh user to be done with it
    className: "sstart",
    start: 10,
    end: window.gameData.hardcore ? 10.4 : 12.9,
    audio: trackAudio[currentTrackNum],
    correctId: currentTrackData.id,
    correctAlbum: currentTrackData.album,
    hadCorrect: result.isCorrect,
    color: gameState.tracks[currentTrackNum].guesses[2] || null,
    userGuess: gameState.tracks[currentTrackNum].userGuess[2] || null
  });

  calcBest(2, result.input);
  end();
}

function createGuessWrappers() {
  const list = document.querySelector(`.songGuessList`);

  list.classList.remove(`in`);
  list.offsetWidth;
  list.classList.add(`in`);

  list.appendChild(createGuessWrapper(`0.5 seconds`, "s05"));
  list.appendChild(
    createGuessWrapper(
      window.gameData.hardcore ? `0.5 seconds` : `1 second`,
      "s1",
      true
    )
  );
  list.appendChild(
    createGuessWrapper(
      window.gameData.hardcore ? `0.5 seconds start` : `start of song`,
      "sstart",
      true
    )
  );
}

function pushGameState() {
  localStorage.setItem(window.runID, JSON.stringify(gameState))
}

document.addEventListener(`DOMContentLoaded`, async () => {
  // get a unique ID for this run
  window.runID =
    (window.gameData.hardcore ? "hardcore-" : "") +
    (window.gameData.hidden ? "hidden-" : "") +
    (window.gameData.oneshot ? "oneshot-" : "") +
    (window.gameData.tracks[0].id + "-") +
    (window.gameData.tracks[1].id + "-") +
    (window.gameData.tracks[2].id + "-") +
    (window.gameData.tracks[3].id + "-") +
    (window.gameData.tracks[4].id);

  if(localStorage.getItem(window.runID)) {
    gameState = JSON.parse(localStorage.getItem(window.runID))
  }
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
});
