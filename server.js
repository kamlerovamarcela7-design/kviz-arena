
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
const seed = [];

function add(text, options, correct, category) {
  seed.push({
    id: 's' + seed.length,
    text,
    options,
    correct,
    category
  });
}

// PŮVODNÍ OTÁZKY
const zaklad = [
['Kolik nohou má pavouk?',['6','8','10','12'],1,'Příroda'],
['Jaké je hlavní město Slovenska?',['Košice','Praha','Bratislava','Žilina'],2,'Zeměpis'],
['Ve kterém sportu se používá puk?',['Fotbal','Hokej','Tenis','Basketbal'],1,'Sport'],
['Jakou barvu získáme smícháním modré a žluté?',['Fialovou','Zelenou','Oranžovou','Růžovou'],1,'Všeobecné'],
['Kolik dní má běžný rok?',['360','364','365','366'],2,'Všeobecné'],
['Které zvíře mňouká?',['Pes','Kočka','Kůň','Ovce'],1,'Příroda'],
['Jak se jmenuje planeta nejblíže Slunci?',['Venuše','Mars','Merkur','Jupiter'],2,'Věda'],
['Jaké ovoce se tradičně používá na štrúdl?',['Jablka','Banány','Kiwi','Ananas'],0,'Jídlo'],
['Kolik hráčů jednoho týmu je na hřišti ve fotbale na začátku zápasu?',['9','10','11','12'],2,'Sport'],
['Který oceán je největší?',['Atlantský','Indický','Tichý','Severní ledový'],2,'Zeměpis'],
['Jak se jmenuje sněhulák z Ledového království?',['Olaf','Shrek','Mimoni','Sven'],0,'Film'],
['Kolik strun má běžná kytara?',['4','5','6','8'],2,'Hudba'],
['Jaké zvíře je symbolem Austrálie?',['Tygr','Klokan','Lední medvěd','Panda'],1,'Zeměpis'],
['Která část rostliny obvykle přijímá vodu z půdy?',['Květ','List','Kořen','Plod'],2,'Příroda'],
['Kdo byl prvním prezidentem Československa?',['Václav Havel','T. G. Masaryk','Edvard Beneš','Karel IV.'],1,'Historie'],
['Jaká je hlavní přísada guacamole?',['Rajče','Avokádo','Brambora','Okurka'],1,'Jídlo'],
['Který hudební nástroj má klávesy?',['Housle','Bicí','Klavír','Flétna'],2,'Hudba'],
['Která řeka protéká Prahou?',['Labe','Morava','Vltava','Odra'],2,'Zeměpis'],
['Kolik minut má jedna hodina?',['30','45','60','90'],2,'Všeobecné'],
['Jak se jmenuje kouzelnická škola Harryho Pottera?',['Bradavice','Narnie','Roklinka','Kamelot'],0,'Film'],
['Který měsíc má obvykle 28 dní?',['Leden','Únor','Duben','Červen'],1,'Všeobecné'],
['Co vyrábějí včely?',['Mléko','Med','Sýr','Máslo'],1,'Příroda'],
['Která země je známá šikmou věží v Pise?',['Španělsko','Itálie','Řecko','Francie'],1,'Zeměpis'],
['Který sport hraje Petra Kvitová?',['Tenis','Golf','Volejbal','Plavání'],0,'Sport']
];

zaklad.forEach(q => add(...q));

// NOVÉ OTÁZKY - ZEMĚPIS
const mesta = [
['Česka','Praha'],
['Rakouska','Vídeň'],
['Německa','Berlín'],
['Polska','Varšava'],
['Maďarska','Budapešť'],
['Francie','Paříž'],
['Itálie','Řím'],
['Španělska','Madrid'],
['Portugalska','Lisabon'],
['Velké Británie','Londýn'],
['Irska','Dublin'],
['Norska','Oslo'],
['Švédska','Stockholm'],
['Finska','Helsinky'],
['Dánska','Kodaň'],
['Nizozemska','Amsterdam'],
['Belgie','Brusel'],
['Švýcarska','Bern'],
['Řecka','Atény'],
['Chorvatska','Záhřeb'],
['Slovinska','Lublaň'],
['Rumunska','Bukurešť'],
['Bulharska','Sofie'],
['Srbska','Bělehrad'],
['Ukrajiny','Kyjev'],
['Turecka','Ankara'],
['Japonska','Tokio'],
['Číny','Peking'],
['Indie','Nové Dillí'],
['Egypta','Káhira'],
['Kanady','Ottawa'],
['USA','Washington, D.C.'],
['Austrálie','Canberra'],
['Brazílie','Brasília'],
['Argentiny','Buenos Aires'],
['Mexika','Ciudad de México'],
['Jižní Koreje','Soul'],
['Thajska','Bangkok'],
['Vietnamu','Hanoj'],
['Islandu','Reykjavík']
];

mesta.forEach(([zeme, spravne], i) => {
  const ostatni = mesta
    .filter(x => x[1] !== spravne)
    .map(x => x[1]);

  const vyber = [
    spravne,
    ostatni[(i * 7 + 3) % ostatni.length],
    ostatni[(i * 7 + 13) % ostatni.length],
    ostatni[(i * 7 + 23) % ostatni.length]
  ];

  const moznosti = [...new Set(vyber)];

  for (const m of ostatni) {
    if (moznosti.length === 4) break;
    if (!moznosti.includes(m)) moznosti.push(m);
  }

  const posun = i % 4;
  const options = [
    ...moznosti.slice(posun),
    ...moznosti.slice(0, posun)
  ];

  add(
    'Jaké je hlavní město ' + zeme + '?',
    options,
    options.indexOf(spravne),
    'Zeměpis'
  );
});

// NOVÉ OTÁZKY - ZVÍŘATA
const zvirata = [
['pes','štěká'],
['kočka','mňouká'],
['kráva','bučí'],
['ovce','bečí'],
['kůň','řehtá'],
['prase','chrochtá'],
['kachna','káče'],
['kohout','kokrhá'],
['žába','kváká'],
['včela','bzučí'],
['had','syčí'],
['holub','vrká'],
['lev','řve'],
['vlk','vyje'],
['sova','houká'],
['myš','piští'],
['osel','hýká'],
['slon','troubí'],
['vrána','kráká'],
['cvrček','cvrká']
];

zvirata.forEach(([zvire, spravne], i) => {
  const zvuky = zvirata.map(x => x[1]);
  const moznosti = [spravne];

  for (let k = 1; moznosti.length < 4; k++) {
    const kandidat = zvuky[(i + k * 3) % zvuky.length];
    if (!moznosti.includes(kandidat)) {
      moznosti.push(kandidat);
    }
  }

  const posun = i % 4;
  const options = [
    ...moznosti.slice(posun),
    ...moznosti.slice(0, posun)
  ];

  add(
    'Jaký zvuk vydává ' + zvire + '?',
    options,
    options.indexOf(spravne),
    'Příroda'
  );
});

// DALŠÍ VŠEOBECNÉ OTÁZKY
const dalsi = [
['Kdo napsal knihu Babička?',['Karel Čapek','Božena Němcová','Alois Jirásek','Jan Neruda'],1,'Literatura'],
['Jaká planeta je známá jako rudá?',['Mars','Venuše','Saturn','Neptun'],0,'Věda'],
['Který pták neumí létat?',['Orel','Vlaštovka','Tučňák','Holub'],2,'Příroda'],
['Kde stojí Eiffelova věž?',['Londýn','Paříž','Vídeň','Řím'],1,'Zeměpis'],
['Jakou barvu má smaragd?',['Modrou','Žlutou','Zelenou','Červenou'],2,'Všeobecné'],
['Který sport se hraje na Wimbledonu?',['Golf','Tenis','Hokej','Fotbal'],1,'Sport'],
['Jaká je hlavní surovina hummusu?',['Rýže','Cizrna','Kukuřice','Brambory'],1,'Jídlo'],
['Kolik stran má trojúhelník?',['2','3','4','5'],1,'Všeobecné'],
['Jaký je největší žijící živočich?',['Slon','Žirafa','Plejtvák obrovský','Hroch'],2,'Příroda'],
['Jakou značku má zlato?',['Ag','Au','Fe','Cu'],1,'Věda'],
['Kdo nazpíval českou znělku Včelky Máji?',['Karel Gott','Michal David','Petr Janda','Dalibor Janda'],0,'Hudba'],
['Jaká řeka protéká Londýnem?',['Seina','Temže','Dunaj','Rýn'],1,'Zeměpis'],
['Jak se jmenuje kovboj z Toy Story?',['Buzz','Woody','Olaf','Shrek'],1,'Film'],
['Který nástroj má obvykle čtyři struny?',['Housle','Klavír','Trubka','Flétna'],0,'Hudba'],
['Která země má tvar boty?',['Francie','Itálie','Norsko','Portugalsko'],1,'Zeměpis'],
['Kdo napsal Romea a Julii?',['Shakespeare','Čapek','Verne','Hašek'],0,'Literatura']
];

dalsi.forEach(q => add(...q));

// 200 DALŠÍCH RŮZNÝCH POČETNÍCH OTÁZEK
// Každá má jiná čísla a čtyři možnosti.

function pocetniOtazka(text, vysledek, i) {
  const spravne = String(vysledek);

  const kandidati = [
    vysledek + 2,
    vysledek - 2,
    vysledek + 5,
    vysledek - 5,
    vysledek + 10,
    vysledek + 1,
    vysledek - 1
  ];

  const moznosti = [spravne];

  for (const cislo of kandidati) {
    const hodnota = String(cislo);
    if (cislo >= 0 && !moznosti.includes(hodnota)) {
      moznosti.push(hodnota);
    }
    if (moznosti.length === 4) break;
  }

  const posun = i % 4;
  const options = [
    ...moznosti.slice(posun),
    ...moznosti.slice(0, posun)
  ];

  add(text, options, options.indexOf(spravne), 'Počty');
}

// 100 otázek na sčítání
for (let i = 0; i < 100; i++) {
  const a = 11 + i;
  const b = 7 + (i % 13);

  pocetniOtazka(
    'Kolik je ' + a + ' + ' + b + '?',
    a + b,
    i
  );
}

// 50 otázek na odčítání
for (let i = 0; i < 50; i++) {
  const a = 40 + i * 2;
  const b = 9 + (i % 17);

  pocetniOtazka(
    'Kolik je ' + a + ' − ' + b + '?',
    a - b,
    i + 100
  );
}

// 50 otázek na násobení
for (let i = 0; i < 50; i++) {
  const a = 3 + i;
  const b = 2 + (i % 9);

  pocetniOtazka(
    'Kolik je ' + a + ' × ' + b + '?',
    a * b,
    i + 150
  );
}

// CELKEM 300 OTÁZEK
console.log('Načteno otázek:', seed.length);

function code() {
  let c;
  do {
    c = String(Math.floor(100000 + Math.random() * 900000));
  } while (rooms.has(c));
  return c;
}

const clean = s => String(s || '').trim().slice(0, 60);

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
    answer: r.phase === 'result' ? r.active?.correct : null,
    used: r.used.size,
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
    const c = code();

    const r = {
      code: c,
      host: s.id,
      hostToken: crypto.randomUUID(),
      hostConnected: true,
      hostPlayerId: null,
      players: new Map(),
      questions: [...seed],
      used: new Set(),
      phase: 'lobby',
      active: null,
      winner: null
    };

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

    if (!r || !data?.hostToken || data.hostToken !== r.hostToken) {
      return reply(cb, {
        error: 'Původní místnost už není dostupná. Založ novou hru.'
      });
    }

    if (r.host && r.host !== s.id) {
      const old = io.sockets.sockets.get(r.host);

      if (old) {
        old.leave(c);
        old.data = {};
        old.emit('notice', 'Moderátorka se připojila na jiném zařízení.');
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
        return reply(cb, { error: 'Přezdívka už je obsazená.' });
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

    if (
      !text ||
      options.length !== 4 ||
      options.some(x => !x) ||
      !Number.isInteger(correct) ||
      correct < 0 ||
      correct > 3
    ) {
      return reply(cb, {
        error: 'Vyplň otázku, čtyři odpovědi a správnou možnost.'
      });
    }

    r.questions.push({
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

    const available = r.questions.filter(
      q => !r.used.has(q.id)
    );

    if (!available.length) {
      return reply(cb, {
        error: 'Všechny otázky byly použity. Dej Nová hra.'
      });
    }

    const q = available[
      Math.floor(Math.random() * available.length)
    ];

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

    if (
      !r ||
      !p ||
      (s.data?.role === 'host'
        ? r.host !== s.id
        : p.socket !== s.id) ||
      r.phase !== 'question'
    ) {
      return reply(cb, {
        error: 'Otázka už není aktivní.'
      });
    }

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index > 3
    ) {
      return reply(cb, {
        error: 'Neplatná odpověď.'
      });
    }

    if (index === r.active.correct) {
      r.phase = 'result';
      r.winner = {
        name: p.name,
        id: p.id
      };

      p.score++;

      reply(cb, {
        ok: true,
        correct: true
      });

      emit(r);
    } else {
      reply(cb, {
        ok: true,
        correct: false
      });
    }
  });

  s.on('reveal', (_, cb) => {
    const r = rooms.get(s.data?.code);

    if (!r || r.host !== s.id) {
      return reply(cb, {
        error: 'Nemáš oprávnění.'
      });
    }

    if (r.phase === 'question') {
      r.phase = 'result';
      r.winner = null;
      emit(r);
    }

    reply(cb, { ok: true });
  });

  s.on('reset', (_, cb) => {
    const r = rooms.get(s.data?.code);

    if (!r || r.host !== s.id) {
      return reply(cb, {
        error: 'Nemáš oprávnění.'
      });
    }

    r.used.clear();
    r.phase = 'lobby';
    r.active = null;
    r.winner = null;

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
