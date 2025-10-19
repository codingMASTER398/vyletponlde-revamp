const circleNum = Number(document.querySelector(`data-circle`).innerText);
const clickElem = document.querySelector(`.click`);
const circleText = document.querySelector(`.circleText`);

let clicked = false,
  audio;

if (circleNum < 6) audio = new Audio(`/audio/circle-1-5.ogg`);
else if (circleNum < 8) audio = new Audio(`/audio/circle-6-no.ogg`);
else if (circleNum < 9) audio = new Audio(`/audio/circle-8.ogg`);
else if (circleNum < 10) audio = new Audio(`/audio/circle-9.ogg`);

window.addEventListener(
  `click`,
  () => {
    clicked = true;

    clickElem.classList.add(`out`);
    circleText.style.display = "block"
    circleText.querySelector(`h1`).innerText = `CIRCLE ${circleNum}`

    if (circleNum >= 9) circleText.classList.add(`animate9`);
    else if (circleNum >= 8) circleText.classList.add(`animate8`);
    else if (circleNum >= 6) circleText.classList.add(`animate6`);
    else if (circleNum >= 3) circleText.classList.add(`animate3`);
    else circleText.classList.add(`animate`);

    audio.volume = Number(localStorage.getItem("volume")) || 1
    audio.play();

    if (circleNum >= 8) wingGush(false);
    if (circleNum >= 8) wingGush(true);
    if (circleNum >= 6) centerConstant();

    if (circleNum >= 9) {
      setTimeout(() => {
        wingGush(false);
        wingGush(true);

        let i = setInterval(() => {
          wingGush(false);
          wingGush(true);
        }, 2252);

        setTimeout(() => {
          clearInterval(i);
        }, 8_000);
      }, 1554);
    }

    setTimeout(()=>{
      const taskElem = document.querySelector(`.task-${circleNum}`);
      taskElem.style.display = "block";
      taskElem.classList.add(`in`)

      taskElem.querySelector(`.start`).addEventListener(`click`, ()=>{
        localStorage.setItem(`theme`, `dark`)
        window.location.href = `/circles-of-hell/${circleNum}/task`
      })
    }, 6_000)
  },
  {
    once: true,
  }
);

// Circle class
const animateInSpeed = circleNum / 2 + 0.2;
let circles = [];

class Circle {
  constructor(num) {
    circles.push(this);

    this.num = num;
    this.fadeIn = num * 1000;
  }

  draw() {
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;

    const offset = Math.sin(millis() / 1000 + this.num) * 100;
    const offsetY = Math.cos(millis() / 2000 + this.num / 4) * 100;

    if (this.fadeIn > 0) this.fadeIn -= deltaTime * animateInSpeed;

    const opacityMultiplier = Math.max(0, 1 - this.fadeIn / 1000);
    const redMult = (255 / 9) * this.num;

    fill(0, 0, 0, 0);
    stroke(255, 255 - redMult, 255 - redMult, 255 * opacityMultiplier);
    strokeWeight(5 + this.num * 4 - Math.min(1, this.fadeIn / 100));

    circle(
      centerX,
      centerY + offsetY,
      this.num * 200 + 300 + offset + this.fadeIn
    );
  }
}

// Canvas
createCanvas(window.innerWidth, window.innerHeight, {
  alpha: true,
});
fullscreen();

draw = () => {
  clear();

  deltaMult = 1000 / 60 / deltaTime;

  strokeWeight(0);
  angleMode("degrees");

  window.particleEmitters.forEach((p) => p.draw());
  particles.forEach((p) => p.draw());

  if (clicked) circles.forEach((c) => c.draw());
};

for (let i = 1; i < circleNum + 1; i++) {
  new Circle(i);
}

if (circleNum >= 3) centerGush();
