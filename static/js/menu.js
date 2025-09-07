function openMenu(id) {
  [...document.querySelector(`.menuContent`).children].forEach((c) => {
    if (c.classList.contains(id)) c.style.display = "";
    else c.style.display = "none";
  });
}

[...document.querySelectorAll(`div[data-menu-id]`)].forEach((c) => {
  c.addEventListener(`click`, () => {
    openMenu(c.getAttribute(`data-menu-id`));
  });
});
