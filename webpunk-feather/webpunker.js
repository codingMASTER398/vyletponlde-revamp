(async () => {
  // *taps the glass*
  
  await require(`./infoUpdater`)();
  console.log("Info updater done");

  await require(`./acronyms`)();
  console.log(`Acronyms done`);

  await require(`./downloader`)();
  console.log(`Downloader done`);

  await require(`./bits`)();
  console.log(`Bits done, all done.`);
})();
