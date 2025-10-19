let chat = [],
  initial = true,
  currentNumber = 0;

const textElement = document.querySelector(`.lastMessage`),
  fromElement = document.querySelector(`.from`);

const incorrect = new Audio(`/audio/wrong.mp3`);
const correct = new Audio(`/audio/correct.mp3`);

setInterval(async () => {
  const next = await (await fetch(`/yt/last5`)).json();

  if (initial) {
    initial = false;
    chat = next;
    return;
  }

  next.forEach((element, i) => {
    if (chat.find((i) => i.user === element.user && i.text === element.text))
      return;

    setTimeout(() => {
      const num = Number(element.text);

      textElement.innerText = element.text;
      fromElement.innerText = `@` + element.user;

      textElement.classList.remove(`green`);
      textElement.classList.remove(`red`);

      if (num === currentNumber + 1) {
        textElement.classList.add(`green`);
        currentNumber++;

        correct.volume = window.volume;
        correct.play();
        correct.currentTime = 0;

        if(correctNumber == 30) {
          alert(`yay!`)
          window.location.href = "/circles-of-hell/7/intro"
        }
      } else {
        textElement.classList.add(`red`);
        currentNumber = 0;

        incorrect.volume = window.volume;
        incorrect.play();
        incorrect.currentTime = 0;
      }
    }, i * 150);
  });

  chat = next;
}, 1_000);
