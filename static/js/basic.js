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
      const nn = new Audio("/audio/nightMode.ogg")
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
}

function toggleTheme() {
  themeSwitch(!(localStorage.getItem(`theme`) == "dark"));
}

document.querySelector(`.themeToggle`).addEventListener(`click`, toggleTheme);

document.querySelector(`.logo`).addEventListener(`click`, () => {
  window.location.href = `/`;
});

themeSwitch(localStorage.getItem(`theme`) == "dark", true);

// it's 9:40pm forgive me pls
window.volume = Number(localStorage.getItem("volume")) || 0.2;
document.querySelector(`.volumeSlider`).value = window.volume;
document.querySelector(`.volumeSlider`).addEventListener(`input`, () => {
  window.volume = Number(document.querySelector(`.volumeSlider`).value);
  localStorage.setItem(
    "volume",
    document.querySelector(`.volumeSlider`).value
  );
});