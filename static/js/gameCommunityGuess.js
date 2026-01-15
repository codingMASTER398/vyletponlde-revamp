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

async function startNewRound() {
  const autoComplete = setupAutoComplete(
    document.querySelector(`.songGuessList`)
  );

  autoComplete.onEnter(async (f, _, album) => {
    const correct = f === window.correctID;
    const isCorrectAlbum = album === window.track.album;
    const alreadyID = `communityGuessed.${window.guessID}.${window.correctID}`;

    document.querySelector(`.gameArea`).style.display = "none";
    document.querySelector(`.congrats`).style.display = "";

    if (localStorage.getItem(alreadyID)) {
      document.querySelector(`.congrats p`).innerText =
        `You already guessed before. Really?`;
      return; // early return
    } else if (correct) {
      document.querySelector(`.congrats h1`).innerText = `Congratulations!`;
      document.querySelector(`.congrats p`).innerText =
        `${window.track.title} is correct.`;
      confettiWinBig();
      confettiWin();
    } else if (isCorrectAlbum) {
      document.querySelector(`.congrats h1`).innerText = `Close!`;
      document.querySelector(`.congrats p`).innerText =
        `The track is in "${window.track.album}".`;
      confettiCorrect();
    }

    localStorage.setItem(alreadyID, true);

    await fetch(
      `/api/communityGuess/got/${window.guessID}/${
        correct ? "green" : isCorrectAlbum ? "yellow" : "red"
      }`,
      {
        method: "POST",
      }
    );
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

  window.toLoad--;

  //
  setInterval(async () => {
    const updateOut = await fetch(
      `/api/communityGuess/details/${window.guessID}`
    );
    const json = await updateOut.json();

    if (json.correct !== window.correctID) window.location.reload();
  }, 5_000);
});
