const correctID = window.gameData.tracks[0].id;

fetch(`/api/communityGuess/register/${correctID}`, {
  method: "POST",
});
(async () => {
  // First, get an ID and a key
  let id, key;
  const lastID = localStorage.getItem(`lastCommunityID`),
    lastKey = localStorage.getItem(`lastCommunityKey`);

  if (lastID && lastKey) {
    const refreshFetch = await fetch(
      `/api/communityGuess/${lastID}/${lastKey}/${correctID}`,
      {
        method: "PATCH",
      }
    );

    if (refreshFetch.status === 200) {
      id = lastID;
      key = lastKey;
    }
  }
  if (!id) {
    const newIDFetch = await fetch(
      `/api/communityGuess/register/${correctID}`,
      {
        method: "POST",
      }
    );

    if(newIDFetch.status !== 200) {
      alert(`The audience guesser couldn't initialize: ${await newIDFetch.text()}`)
      return;
    }

    const json = await newIDFetch.json();

    id = json.id;
    key = json.key;
  }

  // Then, update the UI:
  document.querySelector(`#communityGuess`).style.display = "";
  document.querySelector(`#correctGuesses`).innerText = `🟩 0 🟨 0 🟥 0`;
  document.querySelector(`#guessURL`).innerText = `p.cuti.tv/${id}`

  new QRCode(document.querySelector("#qrcode"), {
    text: "http://p.cuti.tv/" + id,
    width: 96,
    height: 96,
    colorDark: "#000",
    colorLight: "#fff",
    correctLevel: 1,
  });

  localStorage.setItem(`lastCommunityID`, id)
  localStorage.setItem(`lastCommunityKey`, key)

  // And periodically refresh & check it.

  setInterval(async ()=>{
    const res = await fetch(`/api/communityGuess/details/${id}`);

    if(res.status !== 200) {
      document.querySelector(`#correctGuesses`).innerText = `error ${res.status}`;
      return;
    }

    const data = await res.json();

    document.querySelector(`#correctGuesses`).innerText = `🟩 ${data.green} 🟨 ${data.yellow} 🟥 ${data.red}`;
    
    if(data.green > 0) document.querySelector(`#communityGuess`).classList.add(`green`);
    else if(data.yellow > 0) document.querySelector(`#communityGuess`).classList.add(`yellow`);
  }, 2_000)
})();
