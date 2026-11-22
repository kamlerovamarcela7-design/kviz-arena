
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();
const questions = [];

const clean = x => String(x ?? "").trim().slice(0, 80);

function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const levels = ["Lehká", "Střední", "Těžká"];

function add(category, text, correct, wrong, difficulty) {
  const options = shuffle([correct, ...wrong]);
  questions.push({
    id: "q" + questions.length,
    category,
    difficulty,
    text,
    options,
    correct: options.indexOf(correct)
  });
}

function bank(category, rows) {
  rows.forEach((r, i) => {
    add(
      category,
      r[0],
      r[1],
      r.slice(2, 5),
      levels[i % 3]
    );
  });
}

// VĚDOMOSTNÍ OTÁZKY

bank("Film a pohádky", [
  ["Jak se jmenuje sněhulák z Ledového království?", "Olaf", "Sven", "Hans", "Kristoff"],
  ["Kdo je zelený obr z animovaného filmu?", "Shrek", "Hulk", "Grinch", "Po"],
  ["Kde studoval Harry Potter?", "Bradavice", "Nevermore", "Kruval", "Narnie"],
  ["Jak se jmenuje rybka z filmu Hledá se Nemo?", "Nemo", "Dory", "Marlin", "Gill"],
  ["Kdo je hlavní hrdina filmu Sám doma?", "Kevin", "Harry", "Marv", "Peter"],
  ["Jak se jmenuje drak Škyťáka?", "Bezzubka", "Dráček", "Norbert", "Smaug"],
  ["Kdo režíroval Titanic z roku 1997?", "James Cameron", "Steven Spielberg", "Peter Jackson", "Tim Burton"],
  ["Jak se jmenuje hobit nesoucí Prsten?", "Frodo", "Bilbo", "Sam", "Pipin"],
  ["Ve které pohádce vystupuje Popelka?", "Tři oříšky pro Popelku", "Pyšná princezna", "S čerty nejsou žerty", "Princ a Večernice"],
  ["Kdo je autorem Krtečka?", "Zdeněk Miler", "Josef Lada", "Karel Čapek", "Jiří Trnka"],
  ["Která pohádka má postavu Doroty Máchalové?", "S čerty nejsou žerty", "Lotrando a Zubejda", "Anděl Páně", "Princezna ze mlejna"],
  ["Kdo hraje princeznu Krasomilu ve filmu Pyšná princezna?", "Alena Vránová", "Libuše Šafránková", "Jana Preissová", "Helena Růžičková"]
]);

bank("Hudba", [
  ["Kdo zpíval Billie Jean?", "Michael Jackson", "Elvis Presley", "Freddie Mercury", "Prince"],
  ["Která skupina zpívá Bohemian Rhapsody?", "Queen", "ABBA", "U2", "Beatles"],
  ["Kdo složil Vltavu?", "Bedřich Smetana", "Antonín Dvořák", "Leoš Janáček", "Mozart"],
  ["Kdo nazpíval českou znělku Včelky Máji?", "Karel Gott", "Michal David", "Petr Muk", "Waldemar Matuška"],
  ["Kdo složil Čtvero ročních dob?", "Antonio Vivaldi", "Mozart", "Bach", "Beethoven"],
  ["Která skupina má hit Pohoda?", "Kabát", "Chinaski", "Kryštof", "Lucie"],
  ["Který nástroj má obvykle šest strun?", "Kytara", "Housle", "Viola", "Harfa"],
  ["Kdo zpívá Rolling in the Deep?", "Adele", "Rihanna", "Sia", "Madonna"],
  ["Kdo složil operu Rusalka?", "Antonín Dvořák", "Bedřich Smetana", "Leoš Janáček", "Zdeněk Fibich"]
]);

bank("Sport", [
  ["Kolik hráčů má fotbalový tým na hřišti?", "11", "9", "10", "12"],
  ["Ve kterém sportu se používá puk?", "Lední hokej", "Florbal", "Fotbal", "Basketbal"],
  ["Jaký sport proslavil Petru Kvitovou?", "Tenis", "Plavání", "Atletika", "Lyžování"],
  ["Kolik bodů má koš za trojkovou čárou?", "3", "1", "2", "4"],
  ["Který sport kombinuje lyžování a střelbu?", "Biatlon", "Slalom", "Skoky na lyžích", "Snowboarding"],
  ["Kolik kruhů je na olympijské vlajce?", "5", "4", "6", "7"],
  ["Kdo byl českým brankářem při vítězství v Naganu?", "Dominik Hašek", "Petr Čech", "Tomáš Vokoun", "Roman Čechmánek"],
  ["Kde se koná Wimbledon?", "Londýn", "Paříž", "New York", "Melbourne"],
  ["Kolik disciplín má desetiboj?", "10", "8", "9", "12"]
]);

bank("Příroda", [
  ["Kolik nohou má pavouk?", "8", "6", "10", "12"],
  ["Které zvíře má chobot?", "Slon", "Hroch", "Nosorožec", "Žirafa"],
  ["Které zvíře staví hráze?", "Bobr", "Vydra", "Jezevec", "Krtek"],
  ["Jak se jmenuje mládě koně?", "Hříbě", "Tele", "Jehně", "Kůzle"],
  ["Který strom má žaludy?", "Dub", "Buk", "Bříza", "Smrk"],
  ["Který savec klade vejce?", "Ptakopysk", "Koala", "Klokan", "Vombat"],
  ["Jak se nazývá výroba cukrů pomocí světla u rostlin?", "Fotosyntéza", "Dýchání", "Kvašení", "Odpařování"],
  ["Který živočich má tři srdce?", "Chobotnice", "Delfín", "Žralok", "Želva"],
  ["Jak se nazývá věda o houbách?", "Mykologie", "Botanika", "Zoologie", "Geologie"]
]);

bank("Zeměpis", [
  ["Jaké je hlavní město Slovenska?", "Bratislava", "Košice", "Nitra", "Žilina"],
  ["Jaké je hlavní město Německa?", "Berlín", "Mnichov", "Hamburk", "Kolín"],
  ["Jaké je hlavní město Francie?", "Paříž", "Lyon", "Nice", "Marseille"],
  ["Jaké je hlavní město Itálie?", "Řím", "Milán", "Turín", "Neapol"],
  ["Jaké je hlavní město Polska?", "Varšava", "Krakov", "Gdaňsk", "Vratislav"],
  ["Jaké je hlavní město Rakouska?", "Vídeň", "Linec", "Salcburk", "Innsbruck"],
  ["Jaké je hlavní město Maďarska?", "Budapešť", "Debrecín", "Segedín", "Pécs"],
  ["Jaký je nejvyšší vrchol České republiky?", "Sněžka", "Praděd", "Lysá hora", "Klínovec"],
  ["Která řeka protéká Prahou?", "Vltava", "Labe", "Morava", "Dyje"],
  ["Který oceán je největší?", "Tichý", "Atlantský", "Indický", "Severní ledový"]
]);

bank("Historie", [
  ["Kdo byl prvním československým prezidentem?", "T. G. Masaryk", "Edvard Beneš", "Václav Havel", "Klement Gottwald"],
  ["V kterém roce vzniklo Československo?", "1918", "1914", "1938", "1945"],
  ["Kdo nechal postavit Karlův most?", "Karel IV.", "Václav IV.", "Přemysl Otakar II.", "Rudolf II."],
  ["Kdo byl Jan Hus?", "Náboženský reformátor", "Český král", "Mořeplavec", "Hudební skladatel"],
  ["V kterém roce skončila druhá světová válka v Evropě?", "1945", "1939", "1948", "1950"],
  ["Kdy proběhla sametová revoluce?", "1989", "1968", "1993", "1977"],
  ["Kdo byl Napoleon Bonaparte?", "Francouzský císař", "Anglický král", "Římský císař", "Ruský car"],
  ["Kdo objevil pro Evropany Ameriku v roce 1492?", "Kryštof Kolumbus", "Marco Polo", "James Cook", "Vasco da Gama"],
  ["Který český král byl nazýván Otec vlasti?", "Karel IV.", "Jiří z Poděbrad", "Václav II.", "Jan Lucemburský"]
]);

bank("Věda a technika", [
  ["Jaká planeta je nejblíže Slunci?", "Merkur", "Venuše", "Země", "Mars"],
  ["Kolik planet má Sluneční soustava?", "8", "7", "9", "10"],
  ["Jaký plyn potřebuje člověk k dýchání?", "Kyslík", "Dusík", "Vodík", "Helium"],
  ["Jaký je chemický vzorec vody?", "H2O", "CO2", "O2", "NaCl"],
  ["Co měří teploměr?", "Teplotu", "Tlak", "Rychlost", "Vlhkost"],
  ["Který orgán pumpuje krev?", "Srdce", "Plíce", "Játra", "Ledviny"],
  ["Kdo formuloval teorii relativity?", "Albert Einstein", "Isaac Newton", "Nikola Tesla", "Galileo Galilei"],
  ["Jaká jednotka se používá pro elektrický proud?", "Ampér", "Volt", "Watt", "Ohm"],
  ["Co znamená zkratka DNA?", "Deoxyribonukleová kyselina", "Dvojitá nervová aktivita", "Datová nukleární analýza", "Dynamická neuronová aktivita"]
]);

bank("Jídlo", [
  ["Z čeho se vyrábí tradiční české bramboráky?", "Brambory", "Rýže", "Kukuřice", "Čočka"],
  ["Jaká surovina je základem guacamole?", "Avokádo", "Rajče", "Okurka", "Paprika"],
  ["Z jaké země pochází sushi?", "Japonsko", "Itálie", "Mexiko", "Indie"],
  ["Jaký sýr se používá na řecký salát?", "Feta", "Eidam", "Niva", "Parmazán"],
  ["Co je hlavní surovinou hummusu?", "Cizrna", "Fazole", "Čočka", "Hrách"],
  ["Které koření dává kari často žlutou barvu?", "Kurkuma", "Pepř", "Skořice", "Kmín"],
  ["Z čeho se vyrábí tofu?", "Sója", "Mléko", "Pšenice", "Rýže"],
  ["Jaký nápoj se vyrábí z pražených kávových zrn?", "Káva", "Čaj", "Kakao", "Limonáda"],
  ["Jak se nazývá italský dezert s mascarpone a kávou?", "Tiramisu", "Panna cotta", "Gelato", "Cannoli"]
]);

bank("Všeobecné znalosti", [
  ["Kolik dní má přestupný rok?", "366", "365", "364", "367"],
  ["Kolik minut má jedna hodina?", "60", "50", "100", "90"],
  ["Jakou barvu získáme smícháním modré a žluté barvy?", "Zelenou", "Fialovou", "Oranžovou", "Hnědou"],
  ["Kolik stran má trojúhelník?", "3", "4", "5", "6"],
  ["Jaký je největší suchozemský savec?", "Slon africký", "Žirafa", "Hroch", "Nosorožec"],
  ["Kolik měsíců má rok?", "12", "10", "11", "13"],
  ["Který světadíl je největší?", "Asie", "Afrika", "Evropa", "Austrálie"],
  ["Kolik písmen má česká abeceda včetně písmen s diakritikou a ch?", "42", "26", "32", "40"],
  ["Který kov má chemickou značku Au?", "Zlato", "Stříbro", "Měď", "Železo"]
]);

// MATEMATIKA A LOGIKA

for (let i = 1; i <= 60; i++) {
  const a = 5 + i;
  const b = 2 + (i % 13);
  const answer = a + b;
  const wrong = [answer + 1, answer - 1, answer + 3];
  add(
    "Matematika",
    `Kolik je ${a} + ${b}?`,
    String(answer),
    wrong.map(String),
    levels[(i - 1) % 3]
  );
}

for (let i = 1; i <= 45; i++) {
  const a = 3 + (i % 12);
  const b = 2 + (i % 9);
  const answer = a * b;
  const wrong = [...new Set([
    answer + a,
    answer + b,
    answer + 1,
    answer - a,
    answer + 2
  ])].filter(n => n !== answer).slice(0, 3);

  add(
    "Matematika",
    `Kolik je ${a} × ${b}?`,
    String(answer),
    wrong.map(String),
    levels[(i - 1) % 3]
  );
}

// PŘÍSLOVÍ A PRANOSTIKY

const sayings = [
  ["Březen – za kamna ...", "vlezem", "sednem", "běžíme", "půjdeme"],
  ["Duben – ještě tam ...", "budem", "spíme", "sedíme", "ležíme"],
  ["Bez práce nejsou ...", "koláče", "peníze", "prázdniny", "radosti"],
  ["Kdo jinému jámu kopá, sám do ní ...", "padá", "skočí", "kouká", "běží"],
  ["Ranní ptáče dál ...", "doskáče", "doletí", "dohlédne", "dojde"],
  ["Darovanému koni na zuby ...", "neheleď", "koukej", "nesahej", "neklepej"],
  ["Jak se do lesa volá, tak se z lesa ...", "ozývá", "vrací", "chodí", "utíká"],
  ["Kdo se směje naposled, ten se směje ...", "nejlépe", "nejhlasitěji", "nejdříve", "nejdéle"],
  ["Lež má krátké ...", "nohy", "ruce", "vlasy", "uši"],
  ["Kdo šetří, má za ...", "tři", "dva", "čtyři", "pět"],
  ["Tichá voda břehy ...", "mele", "hladí", "omývá", "barví"],
  ["Komu se nelení, tomu se ...", "zelení", "daří", "směje", "svítí"],
  ["Svatá Anna – chladna ...", "zrána", "večer", "voda", "tráva"],
  ["Na svatého Martina kouřívá se z ...", "komína", "lesa", "pole", "kopce"],
  ["Únor bílý, pole ...", "sílí", "zelená", "čeká", "odpočívá"],
  ["Květen studený, rok ...", "úrodný", "slunečný", "suchý", "krátký"],
  ["Co se v mládí naučíš, ve stáří jako když ...", "najdeš", "ztratíš", "zapomeneš", "uslyšíš"],
  ["Kdo chce psa bít, hůl si vždycky ...", "najde", "koupí", "vyrobí", "půjčí"],
  ["Lepší vrabec v hrsti než holub na ...", "střeše", "stromě", "poli", "okně"],
  ["Jablko nepadá daleko od ...", "stromu", "domu", "plotu", "zahrady"],
  ["Tak dlouho se chodí se džbánem pro vodu, až se ...", "ucho utrhne", "voda vylije", "džbán ztratí", "studna zavře"],
  ["Kdo pozdě chodí, sám sobě ...", "škodí", "radí", "pomáhá", "věří"],
  ["Kdo hledá, ...", "najde", "ztratí", "čeká", "bloudí"],
  ["Dvakrát měř, jednou ...", "řež", "piš", "važ", "čti"],
  ["Není všechno zlato, co se ...", "třpytí", "leskne", "prodává", "ukrývá"],
  ["Co oči nevidí, to srdce ...", "nebolí", "nechce", "nezná", "neslyší"],
  ["Pod svícnem bývá největší ...", "tma", "světlo", "teplo", "zima"],
  ["S poctivostí nejdál ...", "dojdeš", "doběhneš", "dojedeš", "dohlédneš"],
  ["Starého psa novým kouskům ...", "nenaučíš", "nepřinutíš", "neporučíš", "neukážeš"],
  ["Všude dobře, doma ...", "nejlépe", "krásně", "teplo", "klidně"],
  ["Kdo si počká, ten se ...", "dočká", "zasměje", "projde", "unaví"],
  ["Kdo maže, ten ...", "jede", "běží", "vyhraje", "skáče"],
  ["Host do domu, Bůh do ...", "domu", "kuchyně", "světnice", "zahrady"],
  ["Když se dva perou, třetí se ...", "směje", "schová", "bojí", "ptá"],
  ["Kovářova kobyla chodí ...", "bosa", "rychle", "pomalu", "daleko"]
];

sayings.forEach((r, i) => {
  add(
    "Přísloví a pranostiky",
    r[0],
    r[1],
    r.slice(2),
    levels[i % 3]
  );
});

// PRAVDA NEBO LEŽ

const facts = [
  ["Tučňák umí létat.", false],
  ["Pavouk má osm nohou.", true],
  ["Slon je savec.", true],
  ["Praha je hlavní město Slovenska.", false],
  ["Voda za běžného atmosférického tlaku vře přibližně při 100 °C.", true],
  ["Netopýr je pták.", false],
  ["Žirafa má dlouhý krk.", true],
  ["Včely vyrábějí med.", true],
  ["Mars je hvězda.", false],
  ["Země obíhá kolem Slunce.", true],
  ["Člověk má tři plíce.", false],
  ["Česká republika leží v Evropě.", true],
  ["Sněžka je nejvyšší hora České republiky.", true],
  ["Delfín je ryba.", false],
  ["Led je pevné skupenství vody.", true],
  ["Krokodýl je savec.", false],
  ["Venuše je planeta.", true],
  ["Chobotnice má osm ramen.", true],
  ["Měsíc je hvězda.", false],
  ["Brambory rostou na stromech.", false],
  ["Růže může mít trny.", true],
  ["Mrkev je kořenová zelenina.", true],
  ["Olympijská vlajka má sedm kruhů.", false],
  ["Koala je vačnatec.", true],
  ["Sahara je poušť.", true],
  ["Jupiter je menší než Země.", false],
  ["Bambus patří mezi trávy.", true],
  ["Včela má šest nohou.", true],
  ["Lidské srdce má čtyři oddíly.", true],
  ["Žralok je obojživelník.", false]
];

facts.forEach(([text, truth], i) => {
  questions.push({
    id: "truth-" + i,
    category: "Pravda, nebo lež",
    difficulty: levels[i % 3],
    text,
    options: ["PRAVDA", "LEŽ"],
    correct: truth ? 0 : 1
  });
});

// CO SEM NEPATŘÍ

const odd = [
  [["Jablko", "Hruška", "Mrkev", "Švestka"], 2],
  [["Pes", "Kočka", "Kůň", "Dub"], 3],
  [["Leden", "Únor", "Pondělí", "Březen"], 2],
  [["Praha", "Brno", "Ostrava", "Slovensko"], 3],
  [["Kytara", "Housle", "Klavír", "Mrkev"], 3],
  [["Slon", "Lev", "Tygr", "Tulipán"], 3],
  [["Modrá", "Zelená", "Červená", "Stůl"], 3],
  [["Vltava", "Labe", "Morava", "Sněžka"], 3],
  [["Růže", "Tulipán", "Slunečnice", "Medvěd"], 3],
  [["Fotbal", "Tenis", "Hokej", "Lednice"], 3],
  [["Jupiter", "Mars", "Venuše", "Měsíc"], 3],
  [["Princ", "Princezna", "Král", "Kominík"], 3],
  [["Drak", "Víla", "Čaroděj", "Autobus"], 3],
  [["Káva", "Čaj", "Kakao", "Sýr"], 3],
  [["Berlín", "Vídeň", "Paříž", "Alpy"], 3],
  [["Sova", "Orel", "Vrabec", "Kapr"], 3],
  [["Housenka", "Motýl", "Včela", "Delfín"], 3],
  [["Zima", "Jaro", "Léto", "Sobota"], 3],
  [["Lžíce", "Vidlička", "Nůž", "Polštář"], 3],
  [["Smrk", "Borovice", "Jedle", "Tulipán"], 3]
];

odd.forEach(([items, answer], i) => {
  const good = items[answer];
  const options = shuffle(items);
  questions.push({
    id: "odd-" + i,
    category: "Co sem nepatří",
    difficulty: levels[i % 3],
    text: "Co sem nepatří?",
    options,
    correct: options.indexOf(good)
  });
});

// OBRÁZKOVÉ OTÁZKY
// Obrázky jsou SVG kartičky s emoji.

const imageSets = [
  [
    "Zvířata",
    [
      ["🐘", "Slon"], ["🐅", "Tygr"],
      ["🦒", "Žirafa"], ["🦁", "Lev"],
      ["🐼", "Panda"], ["🐧", "Tučňák"],
      ["🦓", "Zebra"], ["🦊", "Liška"],
      ["🐻", "Medvěd"], ["🐨", "Koala"],
      ["🐬", "Delfín"], ["🐢", "Želva"],
      ["🐙", "Chobotnice"], ["🦋", "Motýl"],
      ["🐝", "Včela"], ["🦉", "Sova"],
      ["🦜", "Papoušek"], ["🦩", "Plameňák"],
      ["🦔", "Ježek"], ["🐸", "Žába"],
      ["🐌", "Šnek"], ["🦀", "Krab"],
      ["🐊", "Krokodýl"], ["🦇", "Netopýr"],
      ["🐪", "Velbloud"]
    ]
  ],
  [
    "Pohádkové bytosti",
    [
      ["🐉", "Drak"], ["🧚", "Víla"],
      ["🧙", "Čaroděj"], ["🧜", "Mořská panna"],
      ["🧝", "Elf"], ["🦄", "Jednorožec"],
      ["👸", "Princezna"], ["🤴", "Princ"],
      ["👑", "Král"], ["👹", "Obr"],
      ["👻", "Duch"], ["🧞", "Džin"],
      ["🧛", "Upír"], ["🧟", "Zombie"],
      ["🧌", "Troll"], ["🧙‍♀️", "Čarodějnice"],
      ["🧚‍♀️", "Lesní víla"], ["🧜‍♂️", "Mořský muž"],
      ["🧝‍♀️", "Elfka"], ["🐲", "Dračí mládě"],
      ["🏰", "Pohádkový hrad"], ["🪄", "Kouzelná hůlka"],
      ["🔮", "Křišťálová koule"], ["🧹", "Čarodějné koště"],
      ["🪞", "Kouzelné zrcadlo"], ["🍎✨", "Kouzelné jablko"],
      ["🎃", "Dýňový strašák"], ["🧚‍♂️", "Skřítek"],
      ["🦄🌈", "Kouzelný jednorožec"],
      ["👞", "Kouzelná bota"]
    ]
  ],
  [
    "Rostliny",
    [
      ["🌹", "Růže"], ["🌻", "Slunečnice"],
      ["🌷", "Tulipán"], ["🌼", "Kopretina"],
      ["🌸", "Třešňový květ"], ["🌺", "Ibišek"],
      ["🪻", "Levandule"], ["🌵", "Kaktus"],
      ["🌴", "Palma"], ["🌲", "Jehličnan"],
      ["🌳", "Listnatý strom"], ["🍀", "Čtyřlístek"],
      ["🌿", "Bylina"], ["🪷", "Lotos"],
      ["🎋", "Bambus"]
    ]
  ],
  [
    "Jídlo",
    [
      ["🍕", "Pizza"], ["🍔", "Hamburger"],
      ["🍟", "Hranolky"], ["🌭", "Párek v rohlíku"],
      ["🍣", "Sushi"], ["🍩", "Kobliha"],
      ["🥐", "Croissant"], ["🥨", "Preclík"],
      ["🧀", "Sýr"], ["🥞", "Palačinky"],
      ["🍦", "Zmrzlina"], ["🍰", "Dort"],
      ["🥑", "Avokádo"], ["🌮", "Taco"],
      ["🍉", "Meloun"]
    ]
  ],
  [
    "Památky a místa",
    [
      ["🗼", "Eiffelova věž"],
      ["🗽", "Socha Svobody"],
      ["🏯", "Japonský hrad"],
      ["🏰", "Hrad"],
      ["🕌", "Mešita"],
      ["⛩️", "Japonská brána"],
      ["🛕", "Chrám"],
      ["🏛️", "Antický chrám"],
      ["🎡", "Ruské kolo"],
      ["🌉", "Most"],
      ["🗿", "Kamenná socha"],
      ["⛲", "Fontána"],
      ["🎠", "Kolotoč"],
      ["🏟️", "Stadion"],
      ["🗻", "Hora Fudži"],
      ["🏝️", "Tropický ostrov"],
      ["🌋", "Sopka"],
      ["🏜️", "Poušť"],
      ["🌌", "Noční obloha"],
      ["🛸", "Létající talíř"]
    ]
  ]
];

function picture(emoji) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'width="480" height="280" viewBox="0 0 480 280">' +
    '<rect width="480" height="280" rx="24" fill="#edf3ff"/>' +
    '<circle cx="240" cy="140" r="112" fill="#dce7ff"/>' +
    '<text x="240" y="185" font-size="132" ' +
    'text-anchor="middle" ' +
    'font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">' +
    emoji +
    '</text></svg>';

  return "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(svg);
}

imageSets.forEach(([category, entries]) => {
  entries.forEach(([emoji, good], i) => {
    const wrong = shuffle(
      entries
        .filter(x => x[1] !== good)
        .map(x => x[1])
    ).slice(0, 3);

    const options = shuffle([good, ...wrong]);

    questions.push({
      id: "img-" + category + "-" + i,
      category,
      difficulty: levels[i % 3],
      text: "Co vidíš na obrázku?",
      image: picture(emoji),
      options,
      correct: options.indexOf(good)
    });
  });
});

// SPRÁVA HER

function makeRoomCode() {
  let code;
  do {
    code = String(crypto.randomInt(100000, 1000000));
  } while (rooms.has(code));
  return code;
}

function chooseGame(r) {
  const pool = questions.filter(
    q => q.difficulty === r.difficulty
  );

  let fresh = shuffle(
    pool.filter(q => !r.seen.has(q.id))
  );

  if (fresh.length < r.limit) {
    r.seen.clear();
    fresh = shuffle(pool);
  }

  const images = shuffle(fresh.filter(q => q.image));
  const texts = shuffle(fresh.filter(q => !q.image));

  const imageCount = Math.min(
    Math.round(r.limit / 3),
    images.length
  );

  const chosen = [
    ...images.slice(0, imageCount),
    ...texts.slice(0, r.limit - imageCount)
  ];

  const used = new Set(chosen.map(q => q.id));

  chosen.push(
    ...fresh
      .filter(q => !used.has(q.id))
      .slice(0, r.limit - chosen.length)
  );

  const custom = shuffle(r.customQuestions || [])
    .slice(0, Math.min(4, chosen.length));

  for (let i = 0; i < custom.length; i++) {
    chosen[i] = custom[i];
  }

  for (const q of chosen) {
    r.seen.add(q.id);
  }

  r.gameQuestions = shuffle(chosen);
  r.index = 0;
  r.active = null;
  r.phase = "lobby";
  r.winner = null;
  r.attempts = new Map();
}

function state(r) {
  const players = [...r.players.values()]
    .map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      connected: p.connected
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.name.localeCompare(b.name, "cs")
    );

  return {
    code: r.code,
    phase: r.phase,
    players,
    question: r.active ? {
      id: r.active.id,
      text: r.active.text,
      options: r.active.options,
      category: r.active.category,
      difficulty: r.active.difficulty,
      image: r.active.image || null,
      bonus: r.active.bonus
    } : null,
    winner: r.winner,
    answer: ["result", "finished"].includes(r.phase)
      ? r.active?.correct
      : null,
    used: r.index,
    total: r.limit,
    finished: r.phase === "finished",
    hostConnected: r.hostConnected,
    hostPlaying: !!r.hostPlayerId,
    difficulty: r.difficulty
  };
}

function emit(r) {
  io.to(r.code).emit("state", state(r));
}

function reply(cb, result) {
  if (typeof cb === "function") {
    cb(result);
  }
}

function authorized(socket) {
  const r = rooms.get(socket.data?.code);
  return r && r.host === socket.id ? r : null;
}

function finish(r) {
  r.phase = r.index >= r.limit
    ? "finished"
    : "result";
}

function attachHost(socket, r) {
  socket.join(r.code);

  r.host = socket.id;
  r.hostConnected = true;

  socket.data = {
    code: r.code,
    role: "host"
  };

  if (r.hostPlayerId) {
    const p = r.players.get(r.hostPlayerId);
    if (p) {
      p.connected = true;
      p.socket = socket.id;
    }
  }

  emit(r);
}

// KOMUNIKACE S HRÁČI

io.on("connection", socket => {

  socket.on("create", (data, cb) => {
    const limit = [20, 30, 40].includes(Number(data?.limit))
      ? Number(data.limit)
      : 20;

    const difficulty = levels.includes(data?.difficulty)
      ? data.difficulty
      : "Střední";

    const code = makeRoomCode();

    const r = {
      code,
      limit,
      difficulty,
      host: socket.id,
      hostToken: crypto.randomUUID(),
      hostConnected: true,
      hostPlayerId: null,
      players: new Map(),
      seen: new Set(),
      customQuestions: []
    };

    chooseGame(r);
    rooms.set(code, r);
    attachHost(socket, r);

    reply(cb, {
      ok: true,
      code,
      hostToken: r.hostToken
    });
  });

  socket.on("resumeHost", (data, cb) => {
    const r = rooms.get(clean(data?.code));

    if (
      !r ||
      !data?.hostToken ||
      data.hostToken !== r.hostToken
    ) {
      return reply(cb, {
        error: "Původní místnost už není dostupná. Založ novou hru."
      });
    }

    if (r.host && r.host !== socket.id) {
      const old = io.sockets.sockets.get(r.host);

      if (old) {
        old.leave(r.code);
        old.data = {};
        old.emit(
          "notice",
          "Moderátorka se připojila na jiném zařízení."
        );
      }
    }

    attachHost(socket, r);
    reply(cb, { ok: true });
  });

  socket.on("join", (data, cb) => {
    const code = clean(data?.code);
    const name = clean(data?.name);
    const r = rooms.get(code);

    if (!r) {
      return reply(cb, {
        error: "Místnost neexistuje."
      });
    }

    if (!name) {
      return reply(cb, {
        error: "Zadej přezdívku."
      });
    }

    const token = clean(data?.token);
    let p = token && r.players.get(token);

    if (!p) {
      const taken = [...r.players.values()].some(
        x => x.name.toLowerCase() === name.toLowerCase()
      );

      if (taken) {
        return reply(cb, {
          error: "Přezdívka už je obsazená."
        });
      }

      p = {
        id: crypto.randomUUID(),
        name,
        score: 0,
        connected: true,
        socket: socket.id
      };

      r.players.set(p.id, p);
    } else {
      p.connected = true;
      p.socket = socket.id;
    }

    socket.join(code);

    socket.data = {
      code,
      role: "player",
      playerId: p.id
    };

    reply(cb, {
      ok: true,
      token: p.id
    });

    emit(r);
  });

  socket.on("hostPlay", (data, cb) => {
    const r = authorized(socket);

    if (!r) {
      return reply(cb, {
        error: "Jen moderátorka může hrát za sebe."
      });
    }

    if (r.hostPlayerId) {
      return reply(cb, { ok: true });
    }

    const name = clean(data?.name) || "Moderátorka";

    const taken = [...r.players.values()].some(
      p => p.name.toLowerCase() === name.toLowerCase()
    );

    if (taken) {
      return reply(cb, {
        error: "Přezdívka už je obsazená."
      });
    }

    const p = {
      id: crypto.randomUUID(),
      name,
      score: 0,
      connected: true,
      socket: socket.id
    };

    r.hostPlayerId = p.id;
    r.players.set(p.id, p);

    reply(cb, { ok: true });
    emit(r);
  });

  socket.on("next", (_, cb) => {
    const r = authorized(socket);

    if (!r) {
      return reply(cb, {
        error: "Nemáš oprávnění."
      });
    }

    if (r.phase === "question") {
      return reply(cb, {
        error: "Nejdřív dokonči aktuální otázku."
      });
    }

    if (r.phase === "finished") {
      return reply(cb, {
        error: "Hra skončila. Zvol Nová hra."
      });
    }

    if (r.index >= r.limit) {
      r.phase = "finished";
      emit(r);

      return reply(cb, {
        error: "Hra skončila."
      });
    }

    r.active = {
      ...r.gameQuestions[r.index++],
      bonus: r.index === Math.ceil(r.limit / 2)
    };

    r.attempts = new Map();
    r.winner = null;
    r.phase = "question";

    reply(cb, { ok: true });
    emit(r);
  });

  socket.on("answer", (index, cb) => {
    const r = rooms.get(socket.data?.code);

    const id = socket.data?.role === "host"
      ? r?.hostPlayerId
      : socket.data?.playerId;

    const p = r?.players.get(id);

    if (
      !r ||
      !p ||
      (
        socket.data?.role === "host"
          ? r.host !== socket.id
          : p.socket !== socket.id
      ) ||
      r.phase !== "question"
    ) {
      return reply(cb, {
        error: "Otázka už není aktivní."
      });
    }

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= r.active.options.length
    ) {
      return reply(cb, {
        error: "Neplatná odpověď."
      });
    }

    const tried = r.attempts.get(id) || new Set();

    if (tried.has(index)) {
      return reply(cb, {
        error: "Tuto možnost už jsi zkusila."
      });
    }

    tried.add(index);
    r.attempts.set(id, tried);

    if (index === r.active.correct) {
      const points = r.active.bonus ? 2 : 1;

      p.score += points;

      r.winner = {
        name: p.name,
        id: p.id,
        points
      };

      finish(r);

      reply(cb, {
        ok: true,
        correct: true,
        points
      });

      emit(r);
    } else {
      reply(cb, {
        ok: true,
        correct: false
      });
    }
  });

  socket.on("reveal", (_, cb) => {
    const r = authorized(socket);

    if (!r) {
      return reply(cb, {
        error: "Nemáš oprávnění."
      });
    }

    if (r.phase === "question") {
      r.winner = null;
      finish(r);
      emit(r);
    }

    reply(cb, { ok: true });
  });

  // DALŠÍ HRA SE ZMĚNOU NASTAVENÍ

  socket.on("reset", (data, cb) => {
    const r = authorized(socket);

    if (!r) {
      return reply(cb, {
        error: "Nemáš oprávnění."
      });
    }

    if (
      data?.difficulty &&
      levels.includes(data.difficulty)
    ) {
      r.difficulty = data.difficulty;
    }

    if (
      data?.limit &&
      [20, 30, 40].includes(Number(data.limit))
    ) {
      r.limit = Number(data.limit);
    }

    chooseGame(r);

    for (const p of r.players.values()) {
      p.score = 0;
    }

    reply(cb, { ok: true });
    emit(r);
  });

  // VLASTNÍ OTÁZKA MODERÁTORKY

  socket.on("addQuestion", (data, cb) => {
    const r = authorized(socket);

    if (!r) {
      return reply(cb, {
        error: "Jen moderátorka může přidávat otázky."
      });
    }

    const text = clean(data?.text);

    const options = Array.isArray(data?.options)
      ? data.options.map(clean)
      : [];

    const correct = Number(data?.correct);

    if (
      !text ||
      options.length !== 4 ||
      options.some(x => !x) ||
      new Set(options).size !== 4 ||
      !Number.isInteger(correct) ||
      correct < 0 ||
      correct > 3
    ) {
      return reply(cb, {
        error: "Vyplň otázku a čtyři různé odpovědi."
      });
    }

    r.customQuestions.push({
      id: crypto.randomUUID(),
      category: "Vlastní",
      difficulty: r.difficulty,
      text,
      options,
      correct
    });

    reply(cb, { ok: true });
  });

  socket.on("disconnect", () => {
    const r = rooms.get(socket.data?.code);

    if (!r) return;

    if (
      socket.data.role === "host" &&
      r.host === socket.id
    ) {
      r.hostConnected = false;

      if (r.hostPlayerId) {
        const p = r.players.get(r.hostPlayerId);
        if (p) p.connected = false;
      }

      io.to(r.code).emit(
        "notice",
        "Moderátorka se odpojila, může se vrátit."
      );
    } else if (socket.data.role === "player") {
      const p = r.players.get(socket.data.playerId);

      if (p && p.socket === socket.id) {
        p.connected = false;
      }
    }

    emit(r);
  });

});

server.listen(
  process.env.PORT || 3000,
  () => {
    console.log(
      "KVÍZ ARÉNA: " +
      questions.length +
      " otázek, server běží."
    );
  }
);
