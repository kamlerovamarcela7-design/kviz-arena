
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();
const LIMIT = 20;

// 10 témat, každé má 20 různých otázek.
// Zápis: otázka | správná odpověď
const banka = {
  'Film': [
    'Jak se jmenuje sněhulák z Ledového království?|Olaf',
    'Jak se jmenuje kovboj z Toy Story?|Woody',
    'Jak se jmenuje zelený obr ze známého animovaného filmu?|Shrek',
    'Jak se jmenuje kouzelnická škola Harryho Pottera?|Bradavice',
    'Kdo je nejlepší přítel Shreka?|Oslík',
    'Jak se jmenuje rybka hledaná svým otcem ve filmu Pixar?|Nemo',
    'Který film vypráví o lvu Simbovi?|Lví král',
    'Jak se jmenuje sestra Elsy z Ledového království?|Anna',
    'Kdo nosí skleněný střevíček?|Popelka',
    'Jak se jmenuje modrý mimozemšťan z Disneyho filmu?|Stitch',
    'Kdo je hlavní hrdina filmu Sám doma?|Kevin',
    'Jak se jmenuje robot z filmu o opuštěné Zemi?|VALL-I',
    'Jak se jmenuje dívka z filmu Na vlásku?|Locika',
    'Která postava má dlouhý nos, když lže?|Pinocchio',
    'Jak se jmenuje drak z filmu Jak vycvičit draka?|Bezzubka',
    'Kdo je hlavní hrdinka pohádky Sněhurka a sedm trpaslíků?|Sněhurka',
    'Jak se jmenuje žlutá rodinka ze Springfieldu?|Simpsonovi',
    'Kdo je hlavní hrdina filmu Kung Fu Panda?|Po',
    'Jak se jmenuje kouzelná chůva s deštníkem?|Mary Poppins',
    'Který film má postavu Jacka Sparrowa?|Piráti z Karibiku'
  ],
  'Hudba': [
    'Kdo nazpíval českou znělku Včelky Máji?|Karel Gott',
    'Kolik strun má běžná kytara?|Šest',
    'Který nástroj má černé a bílé klávesy?|Klavír',
    'Kdo zpívá píseň Billie Jean?|Michael Jackson',
    'Jak se jmenuje slavná britská skupina s Freddiem Mercurym?|Queen',
    'Který nástroj používá smyčec?|Housle',
    'Kdo zpívá hit Rolling in the Deep?|Adele',
    'Jak se jmenuje česká zpěvačka hitu Láska je láska?|Lucie Bílá',
    'Který nástroj má pedály a velké píšťaly?|Varhany',
    'Kdo zpívá píseň Shape of You?|Ed Sheeran',
    'Která skupina nazpívala Yellow Submarine?|The Beatles',
    'Kdo složil symfonii Z Nového světa?|Antonín Dvořák',
    'Který nástroj má šest strun a pražce?|Kytara',
    'Jak se jmenuje zpěvačka hitu Bad Romance?|Lady Gaga',
    'Kdo zpívá píseň Thriller?|Michael Jackson',
    'Jak se jmenuje česká skupina s hitem Pohoda?|Kabát',
    'Který nástroj má klapky a hraje se na něj foukáním?|Saxofon',
    'Kdo složil Vltavu z cyklu Má vlast?|Bedřich Smetana',
    'Jak se jmenuje zpěvačka hitu Hello z roku 2015?|Adele',
    'Který nástroj se skládá z bubnů a činelů?|Bicí souprava'
  ],
  'Sport': [
    'Ve kterém sportu se používá puk?|Lední hokej',
    'Kolik hráčů jednoho týmu začíná fotbalový zápas na hřišti?|11',
    'Jaký sport hraje Petra Kvitová?|Tenis',
    'Který sport se hraje ve Wimbledonu?|Tenis',
    'Který sport proslavil Usaina Bolta?|Sprint',
    'Jak se jmenuje sport s košem a oranžovým míčem?|Basketbal',
    'V jakém sportu se používá branka a házená?|Házená',
    'Který sport se hraje s badmintonovým košíčkem?|Badminton',
    'Jak se nazývá závod na 42,195 kilometru?|Maraton',
    'V jakém sportu se používá green a jamka?|Golf',
    'Který sport kombinuje běh na lyžích a střelbu?|Biatlon',
    'Jaký sport se provozuje na tatami s chvaty a hody?|Judo',
    'Který sport má disciplínu motýlek?|Plavání',
    'Který sport se hraje přes síť s odbíjením míče?|Volejbal',
    'Jak se jmenuje závodní série monopostů F1?|Formule 1',
    'Který sport využívá kord a fleret?|Šerm',
    'V jakém sportu se používá pálka a mety?|Baseball',
    'Který sport se provozuje na ledě s kameny a košťaty?|Curling',
    'Jak se jmenuje sport s prknem na mořských vlnách?|Surfování',
    'Který sport využívá gymnastickou kladinu?|Sportovní gymnastika'
  ],
  'Příroda': [
    'Kolik nohou má pavouk?|Osm',
    'Které zvíře mňouká?|Kočka',
    'Které zvíře má chobot?|Slon',
    'Co vyrábějí včely?|Med',
    'Který pták neumí létat a žije v Antarktidě?|Tučňák',
    'Jaké zvíře je symbolem Austrálie?|Klokan',
    'Která část rostliny přijímá vodu z půdy?|Kořen',
    'Jak se jmenuje největší žijící živočich?|Plejtvák obrovský',
    'Které zvíře má dlouhý krk?|Žirafa',
    'Jak se jmenuje mládě koně?|Hříbě',
    'Jak se jmenuje mládě krávy?|Tele',
    'Který savec umí aktivně létat?|Netopýr',
    'Které zvíře mění barvu kůže kvůli maskování?|Chameleon',
    'Které zvíře staví hráze na řekách?|Bobr',
    'Jak se jmenuje larva motýla?|Housenka',
    'Které zvíře má bodliny a v nebezpečí se stočí?|Ježek',
    'Jak se jmenuje strom, na kterém rostou žaludy?|Dub',
    'Který strom má bílo-černou kůru?|Bříza',
    'Která část květu vytváří pyl?|Tyčinka',
    'Jak se jmenuje proces, při kterém rostliny využívají světlo?|Fotosyntéza'
  ],
  'Zeměpis': [
    'Jaké je hlavní město Slovenska?|Bratislava',
    'Jaké je hlavní město Německa?|Berlín',
    'Jaké je hlavní město Francie?|Paříž',
    'Jaké je hlavní město Itálie?|Řím',
    'Jaké je hlavní město Polska?|Varšava',
    'Jaké je hlavní město Rakouska?|Vídeň',
    'Jaké je hlavní město Maďarska?|Budapešť',
    'Jaké je hlavní město Španělska?|Madrid',
    'Jaké je hlavní město Portugalska?|Lisabon',
    'Jaké je hlavní město Řecka?|Atény',
    'Jaké je hlavní město Norska?|Oslo',
    'Jaké je hlavní město Švédska?|Stockholm',
    'Jaké je hlavní město Finska?|Helsinky',
    'Jaké je hlavní město Dánska?|Kodaň',
    'Jaké je hlavní město Japonska?|Tokio',
    'Jaké je hlavní město Egypta?|Káhira',
    'Jaké je hlavní město Kanady?|Ottawa',
    'Jaké je hlavní město Austrálie?|Canberra',
    'Jaké je hlavní město Brazílie?|Brasília',
    'Jaké je hlavní město České republiky?|Praha'
  ],
  'Historie': [
    'Kdo byl prvním prezidentem Československa?|T. G. Masaryk',
    'Který český král byl nazýván Otec vlasti?|Karel IV.',
    'Ve kterém roce vzniklo Československo?|1918',
    'Kdy skončila druhá světová válka v Evropě?|1945',
    'Kdo objevil pro Evropany Ameriku roku 1492?|Kryštof Kolumbus',
    'Kdo byl českým králem a římským císařem ve 14. století?|Karel IV.',
    'Který panovník nechal postavit Karlštejn?|Karel IV.',
    'Jak se jmenoval reformátor upálený roku 1415?|Jan Hus',
    'Který vojevůdce vedl husity?|Jan Žižka',
    'Ve kterém roce proběhla sametová revoluce?|1989',
    'Kdo byl prvním prezidentem České republiky?|Václav Havel',
    'Jak se jmenovala egyptská královna spojená s Caesarem?|Kleopatra',
    'Který francouzský vojevůdce byl poražen u Waterloo?|Napoleon Bonaparte',
    'Kdo byl prvním člověkem na Měsíci?|Neil Armstrong',
    'Ve kterém roce přistáli lidé poprvé na Měsíci?|1969',
    'Jak se jmenovala loď, která se potopila roku 1912?|Titanic',
    'Která civilizace stavěla pyramidy v Gíze?|Staří Egypťané',
    'Kdo byl císařem v době založení Pražské univerzity?|Karel IV.',
    'Ve kterém roce se rozdělilo Československo?|1993',
    'Která válka začala roku 1914?|První světová válka'
  ],
  'Jídlo': [
    'Jaká je hlavní přísada guacamole?|Avokádo',
    'Jaké ovoce se tradičně používá do štrúdlu?|Jablko',
    'Z jaké luštěniny se vyrábí hummus?|Cizrna',
    'Z čeho se vyrábí tofu?|Sója',
    'Jaká zelenina je základem kysaného zelí?|Zelí',
    'Jaké ovoce se suší na rozinky?|Hrozny',
    'Jak se jmenuje italský pokrm z rýže?|Rizoto',
    'Jak se jmenuje japonský pokrm s ochucenou rýží?|Sushi',
    'Který sýr pochází z Itálie a používá se na pizzu?|Mozzarella',
    'Z jakého ovoce se vyrábí tradiční cider?|Jablka',
    'Která zelenina dává boršči typickou červenou barvu?|Červená řepa',
    'Jaká surovina je základem čokolády?|Kakao',
    'Jak se jmenuje italský dezert s kávou a mascarpone?|Tiramisu',
    'Jaká luštěnina je základem čočkové polévky?|Čočka',
    'Jak se jmenuje francouzské pečivo ve tvaru půlměsíce?|Croissant',
    'Která obilovina se používá na výrobu běžných ovesných vloček?|Oves',
    'Jaká zelenina je hlavní surovinou bramboráku?|Brambory',
    'Jak se jmenuje omáčka z bazalky, oleje a ořechů?|Pesto',
    'Jaké ovoce je hlavní složkou citronády?|Citron',
    'Který nápoj vzniká louhováním čajových lístků?|Čaj'
  ],
  'Věda': [
    'Která planeta je nejblíže Slunci?|Merkur',
    'Která planeta je známá jako rudá?|Mars',
    'Jaká je chemická značka zlata?|Au',
    'Jaká je chemická značka stříbra?|Ag',
    'Jaká je chemická značka železa?|Fe',
    'Jaká je chemická značka kyslíku?|O',
    'Jaká je chemická značka vodíku?|H',
    'Kolik planet má Sluneční soustava?|Osm',
    'Jak se jmenuje naše galaxie?|Mléčná dráha',
    'Jak se jmenuje přirozená družice Země?|Měsíc',
    'Jaká síla přitahuje předměty k Zemi?|Gravitace',
    'Jak se nazývá přeměna vody v páru?|Vypařování',
    'Jak se nazývá přeměna páry v kapalinu?|Kondenzace',
    'Jak se nazývá přeměna vody v led?|Tuhnutí',
    'Který orgán pumpuje krev?|Srdce',
    'Který orgán slouží k dýchání?|Plíce',
    'Jak se nazývá základní jednotka živého organismu?|Buňka',
    'Který plyn potřebuje člověk k dýchání?|Kyslík',
    'Jaký přístroj měří teplotu?|Teploměr',
    'Jaký přístroj slouží k pozorování velmi malých objektů?|Mikroskop'
  ],
  'Všeobecné': [
    'Kolik dní má běžný rok?|365',
    'Kolik minut má hodina?|60',
    'Kolik měsíců má rok?|12',
    'Kolik dní má týden?|7',
    'Kolik stran má trojúhelník?|3',
    'Kolik stran má čtverec?|4',
    'Jaká barva vznikne smícháním modré a žluté?|Zelená',
    'Jaká barva vznikne smícháním červené a žluté?|Oranžová',
    'Kolik sekund má minuta?|60',
    'Kolik centimetrů má metr?|100',
    'Kolik metrů má kilometr?|1000',
    'Jak se jmenuje autor knihy Babička?|Božena Němcová',
    'Kdo napsal Romea a Julii?|William Shakespeare',
    'Jak se jmenuje nejvyšší české pohoří?|Krkonoše',
    'Jak se jmenuje nejvyšší hora České republiky?|Sněžka',
    'Která řeka protéká Prahou?|Vltava',
    'Jaký jazyk se používá v Brazílii?|Portugalština',
    'Jaké písmeno je první v české abecedě?|A',
    'Kolik hodin má jeden den?|24',
    'Který měsíc následuje po srpnu?|Září'
  ]
};

// 20 matematických otázek, ne 200.
const matematika = [
  ['Kolik je 7 + 8?', '15'],
  ['Kolik je 12 + 9?', '21'],
  ['Kolik je 25 + 17?', '42'],
  ['Kolik je 36 + 14?', '50'],
  ['Kolik je 45 + 28?', '73'],
  ['Kolik je 20 − 7?', '13'],
  ['Kolik je 34 − 16?', '18'],
  ['Kolik je 60 − 25?', '35'],
  ['Kolik je 91 − 38?', '53'],
  ['Kolik je 100 − 64?', '36'],
  ['Kolik je 3 × 7?', '21'],
  ['Kolik je 6 × 8?', '48'],
  ['Kolik je 9 × 9?', '81'],
  ['Kolik je 12 × 4?', '48'],
  ['Kolik je 7 × 11?', '77'],
  ['Kolik je 36 ÷ 6?', '6'],
  ['Kolik je 56 ÷ 7?', '8'],
  ['Kolik je 81 ÷ 9?', '9'],
  ['Kolik je 100 ÷ 4?', '25'],
  ['Kolik je 144 ÷ 12?', '12']
];

banka['Matematika'] = matematika.map(
  ([otazka, odpoved]) => otazka + '|' + odpoved
);

const categories = Object.keys(banka);
const seed = [];
let questionNumber = 0;

// Každá otázka dostane čtyři možnosti.
for (const category of categories) {
  const pairs = banka[category].map(line => {
    const i = line.lastIndexOf('|');
    return {
      text: line.slice(0, i),
      answer: line.slice(i + 1)
    };
  });

  const answers = [...new Set(pairs.map(p => p.answer))];

  pairs.forEach((p, index) => {
    const choices = [p.answer];

    // Nesprávné odpovědi ze stejného tématu.
    for (let offset = 1; choices.length < 4; offset++) {
      const candidate =
        answers[(index + offset * 3) % answers.length];

      if (!choices.includes(candidate)) {
        choices.push(candidate);
      }
    }

    // Náhodné pořadí odpovědí.
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    seed.push({
      id: 's' + questionNumber++,
      text: p.text,
      options: choices,
      correct: choices.indexOf(p.answer),
      category
    });
  });
}

console.log('KVÍZ ARÉNA: načteno', seed.length, 'otázek');

function shuffle(array) {
  const a = [...array];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

function roomCode() {
  let c;

  do {
    c = String(Math.floor(100000 + Math.random() * 900000));
  } while (rooms.has(c));

  return c;
}

const clean = s => String(s || '').trim().slice(0, 60);

function chooseGame(r) {
  const selected = [];

  // Z každého tématu přesně dvě otázky.
  for (const category of categories) {
    const all = seed.filter(q => q.category === category);

    let unused = all.filter(q => !r.usedEver.has(q.id));

    // Po vyčerpání tématu začíná nový cyklus.
    if (unused.length < 2) {
      for (const q of all) r.usedEver.delete(q.id);
      unused = [...all];
    }

    const chosen = shuffle(unused).slice(0, 2);

    chosen.forEach(q => {
      r.usedEver.add(q.id);
      selected.push(q);
    });
  }

  r.gameQuestions = shuffle(selected);
  r.questionIndex = 0;
  r.used = new Set();
  r.active = null;
  r.phase = 'lobby';
  r.winner = null;
}

function state(r) {
  return {
    code: r.code,
    phase: r.phase,
    players: [...r.players.values()]
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        connected: p.connected
      }))
      .sort((a, b) => b.score - a.score),

    question: r.active ? {
      text: r.active.text,
      options: r.active.options,
      category: r.active.category
    } : null,

    winner: r.winner,
    answer: r.phase === 'result' || r.phase === 'finished'
      ? r.active?.correct
      : null,

    used: r.used.size,
    total: LIMIT,
    finished: r.phase === 'finished',
    hostConnected: r.hostConnected,
    hostPlaying: !!r.hostPlayerId
  };
}

function emit(r) {
  io.to(r.code).emit('state', state(r));
}

function reply(cb, data) {
  if (typeof cb === 'function') cb(data);
}

function attachHost(s, r) {
  s.join(r.code);
  r.host = s.id;
  r.hostConnected = true;
  s.data = { code: r.code, role: 'host' };

  if (r.hostPlayerId) {
    const p = r.players.get(r.hostPlayerId);

    if (p) {
      p.connected = true;
      p.socket = s.id;
    }
  }

  emit(r);
}

io.on('connection', s => {

  s.on('create', (_, cb) => {
    const c = roomCode();

    const r = {
      code: c,
      host: s.id,
      hostToken: crypto.randomUUID(),
      hostConnected: true,
      hostPlayerId: null,
      players: new Map(),
      usedEver: new Set(),
      used: new Set(),
      phase: 'lobby',
      active: null,
      winner: null
    };

    chooseGame(r);
    rooms.set(c, r);
    attachHost(s, r);

    reply(cb, {
      ok: true,
      code: c,
      hostToken: r.hostToken
    });
  });

  s.on('resumeHost', (data, cb) => {
    const c = clean(data?.code);
    const r = rooms.get(c);

    if (!r || !data?.hostToken ||
        data.hostToken !== r.hostToken) {
      return reply(cb, {
        error: 'Původní místnost už není dostupná. Založ novou hru.'
      });
    }

    if (r.host && r.host !== s.id) {
      const old = io.sockets.sockets.get(r.host);

      if (old) {
        old.leave(c);
        old.data = {};
        old.emit(
          'notice',
          'Moderátorka se připojila na jiném zařízení.'
        );
      }
    }

    attachHost(s, r);
    reply(cb, { ok: true, code: c });
  });

  s.on('join', (data, cb) => {
    const c = clean(data?.code);
    const name = clean(data?.name);
    const r = rooms.get(c);

    if (!r) {
      return reply(cb, { error: 'Místnost neexistuje.' });
    }

    if (!name) {
      return reply(cb, { error: 'Zadej přezdívku.' });
    }

    const token = clean(data?.token);
    let p = token && r.players.get(token);

    if (!p) {
      if ([...r.players.values()].some(
        x => x.name.toLowerCase() === name.toLowerCase()
      )) {
        return reply(cb, {
          error: 'Přezdívka už je obsazená.'
        });
      }

      const id = crypto.randomUUID();

      p = {
        id,
        name,
        score: 0,
        connected: true,
        socket: s.id
      };

      r.players.set(id, p);
    } else {
      p.connected = true;
      p.socket = s.id;
    }

    s.join(c);

    s.data = {
      code: c,
      role: 'player',
      playerId: p.id
    };

    reply(cb, { ok: true, token: p.id });
    emit(r);
  });

  s.on('hostPlay', (data, cb) => {
    const r = rooms.get(s.data?.code);

    if (!r || r.host !== s.id) {
      return reply(cb, {
        error: 'Jen moderátorka může hrát za sebe.'
      });
    }

    if (r.hostPlayerId) {
      return reply(cb, { ok: true });
    }

    const name = clean(data?.name) || 'Moderátorka';

    if ([...r.players.values()].some(
      p => p.name.toLowerCase() === name.toLowerCase()
    )) {
      return reply(cb, {
        error: 'Tuto přezdívku už někdo používá.'
      });
    }

    const id = crypto.randomUUID();
    r.hostPlayerId = id;

    r.players.set(id, {
      id,
      name,
      score: 0,
      connected: true,
      socket: s.id
    });

    reply(cb, { ok: true });
    emit(r);
  });

  s.on('addQuestion', (data, cb) => {
    const r = rooms.get(s.data?.code);

    if (!r || r.host !== s.id) {
      return reply(cb, {
        error: 'Jen moderátorka může přidávat otázky.'
      });
    }

    const text = clean(data?.text);
    const options = (data?.options || []).map(clean);
    const correct = Number(data?.correct);

    if (!text ||
        options.length !== 4 ||
        options.some(x => !x) ||
        !Number.isInteger(correct) ||
        correct < 0 ||
        correct > 3) {
      return reply(cb, {
        error: 'Vyplň otázku, čtyři odpovědi a správnou možnost.'
      });
    }

    // Vlastní otázka se zařadí do příští hry.
    r.customQuestions = r.customQuestions || [];

    r.customQuestions.push({
      id: crypto.randomUUID(),
      text,
      options,
      correct,
      category: 'Vlastní'
    });

    reply(cb, { ok: true });
    emit(r);
  });

  s.on('next', (_, cb) => {
    const r = rooms.get(s.data?.code);

    if (!r || r.host !== s.id) {
      return reply(cb, { error: 'Nemáš oprávnění.' });
    }

    if (r.phase === 'question') {
      return reply(cb, {
        error: 'Nejdřív dokonči aktuální otázku.'
      });
    }

    if (r.questionIndex >= LIMIT) {
      r.phase = 'finished';
      emit(r);

      return reply(cb, {
        error: 'Hra skončila po 20 otázkách. Dej Nová hra.'
      });
    }

    const q = r.gameQuestions[r.questionIndex];
    r.questionIndex++;

    r.used.add(q.id);
    r.active = q;
    r.phase = 'question';
    r.winner = null;

    reply(cb, { ok: true });
    emit(r);
  });

  s.on('answer', (index, cb) => {
    const r = rooms.get(s.data?.code);

    const id = s.data?.role === 'host'
      ? r?.hostPlayerId
      : s.data?.playerId;

    const p = r?.players.get(id);

    if (!r || !p ||
        (s.data?.role === 'host'
          ? r.host !== s.id
          : p.socket !== s.id) ||
        r.phase !== 'question') {
      return reply(cb, {
        error: 'Otázka už není aktivní.'
      });
    }

    if (!Number.isInteger(index) ||
        index < 0 || index > 3) {
      return reply(cb, {
        error: 'Neplatná odpověď.'
      });
    }

    if (index === r.active.correct) {
      r.phase = r.questionIndex >= LIMIT
        ? 'finished'
        : 'result';

      r.winner = {
        name: p.name,
        id: p.id
      };

      p.score++;

      reply(cb, { ok: true, correct: true });
      emit(r);
    } else {
      reply(cb, { ok: true, correct: false });
    }
  });

  s.on('reveal', (_, cb) => {
    const r = rooms.get(s.data?.code);

    if (!r || r.host !== s.id) {
      return reply(cb, { error: 'Nemáš oprávnění.' });
    }

    if (r.phase === 'question') {
      r.phase = r.questionIndex >= LIMIT
        ? 'finished'
        : 'result';

      r.winner = null;
      emit(r);
    }

    reply(cb, { ok: true });
  });

  s.on('reset', (_, cb) => {
    const r = rooms.get(s.data?.code);

    if (!r || r.host !== s.id) {
      return reply(cb, { error: 'Nemáš oprávnění.' });
    }

    chooseGame(r);

    for (const p of r.players.values()) {
      p.score = 0;
    }

    reply(cb, { ok: true });
    emit(r);
  });

  s.on('disconnect', () => {
    const r = rooms.get(s.data?.code);
    if (!r) return;

    if (s.data.role === 'host' && r.host === s.id) {
      r.hostConnected = false;

      if (r.hostPlayerId) {
        const p = r.players.get(r.hostPlayerId);
        if (p) p.connected = false;
      }

      io.to(r.code).emit(
        'notice',
        'Moderátorka se odpojila, může se vrátit.'
      );

    } else if (s.data.role === 'player') {
      const p = r.players.get(s.data.playerId);

      if (p && p.socket === s.id) {
        p.connected = false;
      }
    }

    emit(r);
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('KVÍZ ARÉNA běží na portu ' + PORT);
});
