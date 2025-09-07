// Handles themes and nav & like misc shtuff

function themeSwitch(dark, initial = false) {
  if (dark) {
    // Switch to dark mode
    document.body.classList.add(`dark`);
    localStorage.setItem(`theme`, `dark`);

    // images
    document.querySelector(`.themeToggle img`).src = `/img/nightmareNight.png`;
    document.querySelector(`.logo`).src = `/logo-dark.webp`;
    document.querySelector(`.volIcon`).src = `/img/volume.png`;

    if (!initial) {
      const nn = new Audio("/audio/nightMode.ogg");
      nn.volume = window.volume;
      nn.play();
    }
  } else {
    // Switch to light mode
    document.body.classList.remove(`dark`);
    localStorage.setItem(`theme`, `light`);

    // images
    document.querySelector(`.themeToggle img`).src = `/img/daybreaker.png`;
    document.querySelector(`.volIcon`).src = `/img/volumeLight.png`;
    document.querySelector(`.logo`).src = `/logo.webp`;
  }

  if(!initial) updateBackground();
}

function toggleTheme() {
  themeSwitch(!(localStorage.getItem(`theme`) == "dark"));
}

document.querySelector(`.themeToggle`).addEventListener(`click`, toggleTheme);

themeSwitch(localStorage.getItem(`theme`) == "dark", true);

// it's 9:40pm forgive me pls
window.volume = Number(localStorage.getItem("volume")) || 0.2;
document.querySelector(`.volumeSlider`).value = window.volume;
document.querySelector(`.volumeSlider`).addEventListener(`input`, () => {
  window.volume = Number(document.querySelector(`.volumeSlider`).value);
  localStorage.setItem("volume", document.querySelector(`.volumeSlider`).value);
});

// okay it's midday but still forgive me
let settings = {
  noLoudSounds: {
    enabled: false,
  },
  reduceMotion: {
    enabled: false,
  },
  hideConfetti: {
    enabled: false,
  },
  reduceAqua: {
    enabled: false,
  },
  /*dolphins: {
    enabled: false,
  },*/
};

function updateSettings() {
  for (const setting in settings) {
    settings[setting].enabled =
      localStorage.getItem(`ponldesetting.${setting}`) === "true";
    settings[setting].onChange?.();

    if (settings[setting].enabled) document.body.classList.add(setting);
    else document.body.classList.remove(setting);
  }
}

updateSettings();

for (const setting in settings) {
  const input = document.querySelector(`input[for="${setting}"]`);

  input.checked = settings[setting].enabled;
  input.addEventListener(`input`, () => {
    localStorage.setItem(`ponldesetting.${setting}`, input.checked);
    updateSettings();
  });
}

/* background */
const bgElem = document.querySelector(`#background`);

const artists = {
  "maxresdefault.jpg": "PlushieCore",
  "djgoober.jpg": "AstroEden",
  "dolphins.jpg": "Christian Riese Lassen",
  "queenIsBack.png": "larvaecandy",
  "gwaw.png": "Elena Fortune",
  "paradiseValley.png": "larvaecandy",
  "carousel.png": "StereoFlier",
  "webpunk.png": "Plushiecore",
  "lps.png": "Vemrill",
  "dragonfly.png": "DishieRX",
  "antonymph.png": "nerkmidz",
}

function updateBackground() {
  localStorage.setItem(`ponldesetting.background`, bgElem.value);

  if(bgElem.value == "none") {
    document.querySelector(`#backgroundThemeStyle`).innerHTML = ``;
    document.querySelector(`#backgroundArtist`).innerText = ``;
    return;
  }

  document.querySelector(`#backgroundThemeStyle`).innerHTML = `
  body, body.dark {
    background:
      ${localStorage.getItem(`theme`) == "dark" ? "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6))" : "linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6))"},
      url(/img/${bgElem.value});
    background-size: cover;
    background-position: center;
  }`;
  document.querySelector(`#backgroundArtist`).innerText = `background art by ` + artists[bgElem.value]
}

bgElem.value =
  localStorage.getItem(`ponldesetting.background`) || "maxresdefault.jpg";
bgElem.addEventListener(`input`, updateBackground);

updateBackground();
