function openMenu(id) {
  [...document.querySelector(`.menuContent`).children].forEach((c) => {
    if (c.classList.contains(id)) c.style.display = "";
    else c.style.display = "none";
  });

  window.location.hash = id;
}

[...document.querySelectorAll(`div[data-menu-id]`)].forEach((c) => {
  c.addEventListener(`click`, () => {
    openMenu(c.getAttribute(`data-menu-id`));
  });
});

document.addEventListener(`DOMContentLoaded`, () => {
  if (
    [
      "#menuNormal",
      "#menuEasy",
      "#menuSpecial",
      "#menuAbout",
      "#menuTracks",
      "#menuCat",
      "#menuArt",
      "#menuLyrics",
      "#menuSpeedrun",
      "#menuWaveform",
    ].includes(window.location.hash)
  ) {
    openMenu(window.location.hash.replace("#", ""));
  }
});
