// AVERT YOUR EYES!!
const badWords = [
  "FUCK", "FUKK", "FUCC", "FUKU", "FUKR", "FUCT", "FUXK",
  "SHIT", "SHYT", "SH1T", "SHET",
  "CUNT", "KUNT", "CUNTY",
  "TWAT", "TWET", "TWIT",
  "COCK", "KOCK", "COKK", "COC",
  "DICK", "DIKK", "DYCK", "DIIC",
  "PISS", "PISY", "P1SS", "P1SY",
  "TITS", "T1TS", "TITZ", "TIIT",
  "SLUT", "SLOT", "SLVT", "SLUTZ",
  "WHORE", "HORE", "WHOAR", "WHR",
  "ASS", "A55", "AZZ", "ARSE",
  "FAG", "FA6", "F4G", "PHAG",
  "DYKE", "DIKE", "DAIK",
  "CRAP", "CRVP", "CR4P",
  "JIZZ", "J1ZZ", "JIZ", "JZ",
  "WANK", "WANC", "W4NK",
  "BLOW", "BL0W", "BLOH",
  "SUCK", "SUC", "SUKK",
  "DAMN", "D4MN", "DARN", "DUMN",
  "HELL", "H3LL", "HECC", "HEL",
  "RAPE", "RAEP", "R4PE", "RAYP",
  "NIGG", "N1GG", "NI66", "NIG",
  "KILL", "K1LL", "KIL",
  "DEAD", "DED", "D34D",
  "GAY", "G4Y", "GHEY",
  "LESB", "LEZ", "LEZZ",
  "FAP", "F4P", "FOP",
  "DIE", "D1E", "D13",
  "SUIC", "SUI", "SUYK",
  "ABRT", "ABRT", "A8RT",
  "MOAN", "M0AN", "M0N",
  "BDSM", "BDSM", "BDSN",
  "BANG", "BNG", "B4NG",
  "SEXY", "SEXX", "S3XY", "SXY"
];

module.exports = (name)=>{
  return badWords.some(bad => name.includes(bad));
}