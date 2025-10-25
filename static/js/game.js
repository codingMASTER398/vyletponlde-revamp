let gameState = {
    tracks: [],
    currentTrack: 0,
    currentGuess: 0,
  },
  trackAudio = [],
  currentlyPlaying = false,
  audioStopShift = 0,
  guess1End,
  guess2End,
  guess3End;

window.toLoad++;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const panner = audioCtx.createStereoPanner();
panner.connect(audioCtx.destination);

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

async function playTrack(audio, from, to, element, disableOtherPlays = true) {
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

  if (window.gameData.circle === 9) {
    // Evil audio panning
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(panner);
    panner.pan.value = Math.random() > 0.5 ? -1 : 1;
  }

  await audio.play();
  audio.volume = window.volume;
  audio.currentTime = from;

  let currentShift = Number(audioStopShift),
    passed = 0,
    lastProcess = performance.now();

  let checkInterval = () => {
    passed += (performance.now() - lastProcess) * 0.001;
    lastProcess = performance.now();

    if (passed >= to - from || audioStopShift != currentShift || audio.paused) {
      audio.pause();

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
    requestAnimationFrame(checkInterval);
  };

  requestAnimationFrame(checkInterval);
}

function setupAutoComplete(element) {
  // Sets up the autocomplete box & registers inputs
  const inputBox = element.querySelector(`input`);
  const resultBox = element.querySelector(`.resultBox`);

  let onEnter, disabled;

  inputBox.classList.add(`current`);

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
  };

  inputBox.addEventListener(`keydown`, autoComplete);
  inputBox.addEventListener(`input`, autoComplete);
  inputBox.addEventListener(`internalSend`, () => {
    autoComplete({
      key: "Enter",
    });
  });

  if (window.gameData.circle === 9) {
    inputBox.setAttribute("disabled", true);
  }

  return {
    onEnter: (f) => {
      onEnter = f;
    },
    disable: () => {
      disabled = true;
      inputBox.blur();
      inputBox.classList.remove(`current`);
    },
  };
}

function setupGuesser(data) {
  // Sets up the guessing logic for a guessWrapper object
  return new Promise((r) => {
    const {
      className,
      start,
      end,
      audio,
      correctId,
      correctAlbum,
      additionalMatches,
    } = data;
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

    if (
      !window.gameData.lyricMode &&
      !window.gameData.artMode &&
      !window.gameData.waveformMode
    )
      element.querySelector(`.playButton`).addEventListener(`click`, () => {
        if (!currentlyPlaying) {
          playTrack(audio, start, end, element);
          if (window.gameData.vylet || window.gameData.onlyOnce) {
            element.querySelector(`.playButton`).classList.add(`removed`);
          }
        }
      });

    element.querySelector(`.skipButton`).addEventListener(`click`, () => {
      if (done) return;
      clickSound();

      // Winter function
      if (window.gameData.winterMode) {
        makeYellowRedGreen("green");
        r({
          isCorrect: true,
          input: ``,
        });
        element.querySelector(`input`).value =
          `(the correct song because im so cool)`;
        return;
      }

      // Skip function
      element.querySelector(`.resultBox`).style.display = "none";
      element.querySelector(`input`).value = "Skipped";
      makeYellowRedGreen("red");
      r({ input: "Skipped" });
    });

    input.onEnter((id, title, album) => {
      element.querySelector(`.resultBox`).style.display = "none";
      element.querySelector(`input`).value = title;

      if (
        correctId == id ||
        window.gameData.winterMode ||
        additionalMatches?.includes?.(id)
      ) {
        if (window.gameData.winterMode)
          element.querySelector(`input`).value =
            `(the correct song because im so cool)`;
        makeYellowRedGreen("green");
        r({
          isCorrect: true,
          input: title,
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
      r({
        isCorrect: data.color == "green",
        isYellow: data.color == "yellow",
        input: data.userGuess,
      });
    } else if (data.hadCorrect) {
      // One above was correct, just return with grey
      makeYellowRedGreen("alreadyAbove");
      r({
        isCorrect: true,
        input: "",
      });
    }
  });
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
  if (typeof data.slice1 === "undefined") data.slice1 = 5;
  if (typeof data.slice2 === "undefined") data.slice2 = 3;
  if (!data.audio.endsWith(`.ogg.ogg`)) data.audio += `.ogg`; // dual weild

  trackAudio[trackNum].base = new Audio(`/api/audio/base/${data.audio}`);

  // Only load these two if it's not the lyric mode
  if (
    !window.gameData.lyricMode &&
    !window.gameData.artMode &&
    !window.gameData.waveformMode
  ) {
    trackAudio[trackNum].one = new Audio(
      `/api/audio/tiny/${data.slice1}-${data.audio}`
    );
    trackAudio[trackNum].two = new Audio(
      `/api/audio/tiny/${data.slice2}-${data.audio}`
    );
  }

  trackAudio[trackNum].base.addEventListener(`canplaythrough`, () => {
    if (loader) window.toLoad--;

    setTimeout(() => {
      // Preload next
      if (
        window.gameData.tracks[trackNum + 1] &&
        !trackAudio[trackNum + 1]?.base
      )
        loadTrackAudio(trackNum + 1, window.gameData.tracks[trackNum + 1]);
    }, 1000);
  });
}

async function startNewRound() {
  // Clean up old data
  document.querySelector(`.roundEnd`).classList.remove(`in`);
  document.querySelector(`.songGuessList`).innerHTML = ``;

  // Then uh get the new data!!!
  const currentTrackData = window.gameData.tracks[gameState.currentTrack],
    currentTrackNum = gameState.currentTrack;

  // Load track audio
  trackAudio[currentTrackNum] ??= {};

  if (!trackAudio[currentTrackNum].base) {
    loadTrackAudio(currentTrackNum, currentTrackData);
  }

  // Set up the state if it doesn't exist already
  gameState.tracks[currentTrackNum] ??= {
    guesses: [],
    userGuess: [],
    image: currentTrackData.image,
    title: currentTrackData.title,
  };

  createGuessWrappers();

  // Set up lyric mode if needed
  const lyricElem = document.querySelector(`.lyric`);

  if (window.gameData.lyricMode) {
    lyricElem.style.display = "block";
    lyricElem.innerHTML = lyricCensor(currentTrackData.lyric, 0.33);
  }

  // Set up art mode if needed
  const artElem = document.querySelector(`.art`);

  if (window.gameData.artMode) {
    artElem.style.display = "block";
    artElem.querySelector(`img`).src =
      `/api/songData/trackart/${currentTrackData.coverArt}.webp`;
    artElem.querySelector(`img`).style.filter = "blur(35px)";
    artElem.classList.remove(`transition`);

    // i have decided hardcore art is now normal art
    // but hardcore hardcore art is like more zoomed in
    // do you understand
    // get vexi
    if (window.gameData.hardcoreArt) artElem.classList.add(`actuallyHardcore`);
    artElem.classList.add(`hardcore`);
    artElem.classList.remove(`transitionOutHardcore`);
    artElem.querySelector(`img`).style.top =
      `-${Math.random() * (window.gameData.hardcoreArt ? 900 : 300)}px`;
    artElem.querySelector(`img`).style.left =
      `-${Math.random() * (window.gameData.hardcoreArt ? 900 : 300)}px`;
    artElem.querySelector(`img`).style.filter = "blur(20px)";
  }

  // Set up waveform mode if needded
  const waveformElem = document.querySelector(`.waveform`);

  if (window.gameData.waveformMode) {
    waveformElem.style.display = "block";
    waveformElem.querySelector(`img`).src =
      `/api/songData/waveform/${currentTrackData.nameId}.png`;
  }

  /// uhhh game i think
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
      playTrack(trackAudio[currentTrackNum].base, 0, 10, false, false);
    }, 100);

    // Show the end track info
    showRoundEndInfo(
      currentTrackData.title,
      window.gameData.artMode
        ? `Art by ${currentTrackData.coverArtAttribution}`
        : currentTrackData.album,
      currentTrackData.image,
      currentTrackData.bandcamp
    );

    // Change the color of the indicators
    document
      .querySelector(`.songIndicators`)
      .children[currentTrackNum + 1].classList.add(best);

    // If it's art, show the whole thing
    artElem.classList.add(`transition`);
    artElem.classList.add(`transitionOutHardcore`);
    artElem.classList.remove(`hardcore`);

    // If it's oneshot, then one shot the the one shot.

    if (window.gameData.oneshot && best != "green") {
      gameState.currentTrack = window.gameData.tracks.length - 1;
    }

    // Yeah.
    if (gameState.currentTrack === (window.gameData.tracks.length - 1)) {
      document.querySelector(`.nextButton`).innerText = "show results";
    }

    document.querySelector(`.nextButton`).addEventListener(
      `click`,
      () => {
        clickSound();

        stopAudio();

        if (
          gameState.currentTrack == (window.gameData.tracks.length - 1)
        ) {
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
    if (result.isCorrect && best != "green") {
      // tada!!
      best = "green";
      confettiCorrect();
    }

    pushGameState();
  };

  result = await setupGuesser({
    // Sets it up and waits for the uh user to be done with it
    className: "s05",
    start: 0,
    end: guess1End,
    audio: trackAudio[currentTrackNum].one,
    correctId: currentTrackData.id,
    additionalMatches: currentTrackData.additionalMatches,
    correctAlbum: currentTrackData.album,
    hadCorrect: result?.isCorrect,
    color: gameState.tracks[currentTrackNum].guesses[0] || null,
    userGuess: gameState.tracks[currentTrackNum].userGuess[0] || null,
  });

  calcBest(0, result.input);
  if (result.isCorrect) end();

  // Show more in lyric mode
  if (window.gameData.lyricMode) {
    lyricElem.innerHTML = lyricCensor(currentTrackData.lyric, 0.66);
  }

  // Show more in art mode
  if (window.gameData.artMode) {
    artElem.querySelector(`img`).style.filter = "blur(10px)";
  }

  result = await setupGuesser({
    // Sets it up and waits for the uh user to be done with it
    className: "s1",
    start: 0,
    end: guess2End,
    audio: trackAudio[currentTrackNum].two,
    correctId: currentTrackData.id,
    additionalMatches: currentTrackData.additionalMatches,
    correctAlbum: currentTrackData.album,
    hadCorrect: result.isCorrect,
    color: gameState.tracks[currentTrackNum].guesses[1] || null,
    userGuess: gameState.tracks[currentTrackNum].userGuess[1] || null,
  });

  calcBest(1, result.input);
  if (result.isCorrect) end();

  // Show more in lyric mode
  if (window.gameData.lyricMode) {
    lyricElem.innerHTML = currentTrackData.lyric;
  }

  // Show more in art mode
  if (window.gameData.artMode) {
    artElem.querySelector(`img`).style.filter = "";
  }

  result = await setupGuesser({
    // Sets it up and waits for the uh user to be done with it
    className: "sstart",
    start: window.gameData.vylet ? 11 : 10,
    end: guess3End,
    audio: trackAudio[currentTrackNum].base,
    correctId: currentTrackData.id,
    additionalMatches: currentTrackData.additionalMatches,
    correctAlbum: currentTrackData.album,
    hadCorrect: result.isCorrect,
    color: gameState.tracks[currentTrackNum].guesses[2] || null,
    userGuess: gameState.tracks[currentTrackNum].userGuess[2] || null,
  });

  calcBest(2, result.input);
  end();
}

function createGuessWrappers() {
  const list = document.querySelector(`.songGuessList`);

  list.classList.remove(`in`);
  list.offsetWidth;
  list.classList.add(`in`);

  let text1 = `0.5 seconds`,
    text2 = `1 second`,
    text3 = `start of song`;

  if (window.gameData.hardcore || window.gameData.lodestar) {
    text1 = `0.5 seconds`;
    text2 = `0.5 seconds`;
    text3 = `0.5s start`;
  }

  if (window.gameData.vylet) {
    text1 = `0.2 seconds`;
    text2 = `0.2 seconds`;
    text3 = `0.2s start`;
  }

  list.appendChild(createGuessWrapper(text1, "s05"));
  list.appendChild(createGuessWrapper(text2, "s1", true));
  list.appendChild(createGuessWrapper(text3, "sstart", true));
}

function pushGameState() {
  localStorage.setItem(window.runID, JSON.stringify(gameState));
}

document.addEventListener(`DOMContentLoaded`, async () => {
  // get a unique ID for this run
  window.runID =
    (window.gameData.waveformMode ? "waveform-" : "") +
    (window.gameData.artMode ? "art-" : "") +
    (window.gameData.hardcoreArt ? "arthc-" : "") +
    (window.gameData.lyricMode ? "lyric-" : "") +
    (window.gameData.hardcore ? "hardcore-" : "") +
    (window.gameData.hidden ? "hidden-" : "") +
    (window.gameData.oneshot ? "oneshot-" : "") +
    (window.gameData.tracks.map((track)=>track.id).join("-"));

  // Parse the saved state
  if (localStorage.getItem(window.runID)) {
    gameState = JSON.parse(localStorage.getItem(window.runID));
  }
  gameState.currentTrack = 0;

  if (gameState.tracks[4] || window.gameData.winterMode) {
    // They already completed it (or they're in winter mode), don't increase win streak
    window.noIncreaseWinStreak = true;
  }

  // Set the end times of the guesses
  guess1End = 0.5;
  guess2End = 1;
  guess3End = 12.5; // with the fade taken into account

  if (window.gameData.hardcore || window.gameData.lodestar) {
    guess2End = 0.5;
    guess3End = 10.5; // with the fade taken into account
  }

  if (window.gameData.vylet) {
    guess1End = 0.2;
    guess2End = 0.2;
    guess3End = 11.2;
  }

  // Get autocomplete data
  const autocompleteData = await (
    await fetch(window.gameData.featherMode ? "/api/songData/autocomplete-feather" : "/api/songData/autocomplete")
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

  window.toLoad--;

  // Circle 9 discord
  let lastId = "",
    initial = true;

  if (window.gameData.circle === 9) {
    setInterval(async () => {
      const message = await (await fetch(`/vyletDiscord/last`)).json();
      if (message[1] !== lastId) {
        lastId = message[1];

        if (initial) {
          initial = false;
          return;
        }

        const inputBox = document.querySelector(`.guessInput.current`);

        if (!inputBox) return;

        inputBox.value = message[0];
        inputBox.dispatchEvent(new Event("input"));
        inputBox.dispatchEvent(new Event("internalSend"));
      }
    }, 500);
  }
});
