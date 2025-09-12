const captchas = [
  [285, 185, 131, 131, "n/a"],
  [100, 113, 65, 65, "NekoSnicker"],
  [0, 407, 94, 90, "NekoSnicker"],
  [369, 279, 132, 70, "AstroEden"],
  [659, 174, 32, 40, "DearMary"],
  [67, 392, 133, 86, "CassettePunk"],
  [48, 232, 41, 34, "AstroEden"],
  [53, 309, 24, 24, "Elena Fortune"],
  [115, 422, 22, 62, "uhm uhhhm"],
  [0, 0, 700, 500, "woohoo!"],
];

const incorrect = new Audio(`/audio/wrong.mp3`);
const correct = new Audio(`/audio/correct.mp3`);

let currentFlow = -1;

function nextFlow() {
  currentFlow++;
  document.querySelector(`#creekImage`).src =
    `/img/creekcaptcha/${currentFlow + 1}.jpg`;
  document.querySelector(`#bgCredit`).innerText =
    `bg credit: ${captchas[currentFlow][4]}`;
}

document.querySelector(`#creekImage`).addEventListener(`click`, (e) => {
  const currentCaptchaLoc = captchas[currentFlow];

  if (
    e.offsetX > currentCaptchaLoc[0] &&
    e.offsetX < currentCaptchaLoc[0] + currentCaptchaLoc[2] &&
    e.offsetY > currentCaptchaLoc[1] &&
    e.offsetY < currentCaptchaLoc[1] + currentCaptchaLoc[3]
  ) {
    if(currentFlow == 9) {
      window.location.href = "/super-duper-secret-vylet-mode"
      return;
    }
    correct.currentTime = 0;
    correct.play();
    nextFlow();
  } else {
    incorrect.currentTime = 0;
    incorrect.play();
  }
});

nextFlow()