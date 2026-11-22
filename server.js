
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
const clean = x => String(x ?? '').trim().slice(0, 80);

function shuffle(xs) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const categories = [
  'Film', 'Hudba', 'Sport', 'Příroda', 'Zeměpis',
  'Historie', 'Jídlo', 'Věda', 'Všeobecné', 'Matematika'
];

// Každý řádek: otázka | správná odpověď | 3 špatné odpovědi
const data = {
  Film: [
    ['Jak se jmenuje sněhulák z Ledového království?', 'Olaf', 'Sven', 'Kristoff', 'Hans'],
    ['Který kovboj je hrdinou Toy Story?', 'Woody', 'Jessie', 'Buzz', 'Andy'],
    ['Kdo je zelený obr z animovaného filmu?', 'Shrek', 'Hulk', 'Grinch', 'Mike Wazowski'],
    ['Jak se jmenuje škola Harryho Pottera?', 'Bradavice', 'Krásnohůlky', 'Kruval', 'Nevermore'],
    ['Která rybka se ztratí ve filmu Pixar?', 'Nemo', 'Dory', 'Marlin', 'Gill'],
    ['Jak se jmenuje sestra Elsy?', 'Anna', 'Locika', 'Vaiana', 'Merida'],
    ['Kdo je hrdinou filmu Sám doma?', 'Kevin', 'Harry', 'Marv', 'Peter'],
    ['Který film má postavu Jacka Sparrowa?', 'Piráti z Karibiku', 'Indiana Jones', 'Jumanji', 'Mumie'],
    ['Kdo je hlavním hrdinou Kung Fu Panda?', 'Po', 'Shifu', 'Tygřice', 'Tai Lung'],
    ['Jak se jmenuje drak Škyťáka?', 'Bezzubka', 'Bouřlivák', 'Drakobijec', 'Rudý běs'],
    ['Kdo režíroval Titanic z roku 1997?', 'James Cameron', 'Steven Spielberg', 'Christopher Nolan', 'Ridley Scott'],
    ['Ve kterém filmu zazní „Ať tě provází Síla“?', 'Star Wars', 'Star Trek', 'Avatar', 'Matrix'],
    ['Kdo ztvárnil Forresta Gumpa?', 'Tom Hanks', 'Brad Pitt', 'Matt Damon', 'Jim Carrey'],
    ['Jak se jmenuje hlavní město Panemu v Hunger Games?', 'Kapitol', 'Bradavice', 'Gondor', 'Metropolis'],
    ['Kdo režíroval Jurský park z roku 1993?', 'Steven Spielberg', 'James Cameron', 'Peter Jackson', 'Tim Burton'],
    ['Jak se jmenuje loď ve filmu Titanic?', 'Titanic', 'Britannic', 'Olympic', 'Carpathia'],
    ['Kdo hraje hlavní roli ve filmu Gladiátor (2000)?', 'Russell Crowe', 'Joaquin Phoenix', 'Brad Pitt', 'Gerard Butler'],
    ['Který film získal Oscara za nejlepší film v roce 2020?', 'Parazit', 'Joker', '1917', 'Tenkrát v Hollywoodu'],
    ['Jak se jmenuje hobit, který nese Prsten?', 'Frodo', 'Bilbo', 'Sam', 'Pipin'],
    ['Který režisér natočil trilogii Pán prstenů?', 'Peter Jackson', 'George Lucas', 'Tim Burton', 'David Fincher'],
    ['Jak se jmenuje hotel ve filmu Osvícení?', 'Overlook', 'Bates', 'Continental', 'Grand Budapest'],
    ['Kdo ztvárnil Jokera ve filmu z roku 2019?', 'Joaquin Phoenix', 'Heath Ledger', 'Jared Leto', 'Jack Nicholson'],
    ['Který film vypráví o Freddiem Mercurym?', 'Bohemian Rhapsody', 'Rocketman', 'Walk the Line', 'Elvis'],
    ['Jak se jmenuje planeta ve filmu Avatar?', 'Pandora', 'Arrakis', 'Tatooine', 'Krypton']
  ],
  Hudba: [
    ['Kdo zpívá Billie Jean?', 'Michael Jackson', 'Prince', 'Stevie Wonder', 'George Michael'],
    ['Kdo zpívá Rolling in the Deep?', 'Adele', 'Sia', 'Rihanna', 'Beyoncé'],
    ['Která skupina zpívá Bohemian Rhapsody?', 'Queen', 'ABBA', 'U2', 'Coldplay'],
    ['Kdo zpívá Shape of You?', 'Ed Sheeran', 'Sam Smith', 'Bruno Mars', 'Justin Bieber'],
    ['Kdo zpívá Bad Romance?', 'Lady Gaga', 'Katy Perry', 'Madonna', 'Pink'],
    ['Kdo složil Vltavu?', 'Bedřich Smetana', 'Antonín Dvořák', 'Leoš Janáček', 'Bohuslav Martinů'],
    ['Kdo složil symfonii Z Nového světa?', 'Antonín Dvořák', 'Bedřich Smetana', 'Gustav Mahler', 'Ludwig van Beethoven'],
    ['Která skupina nazpívala Yellow Submarine?', 'The Beatles', 'The Rolling Stones', 'Queen', 'The Who'],
    ['Kdo nazpíval českou znělku Včelky Máji?', 'Karel Gott', 'Waldemar Matuška', 'Michal David', 'Petr Muk'],
    ['Která česká skupina zpívá Pohodu?', 'Kabát', 'Chinaski', 'Kryštof', 'Lucie'],
    ['Kdo zpívá hit Hello z roku 2015?', 'Adele', 'Taylor Swift', 'Dua Lipa', 'Ariana Grande'],
    ['Kdo složil Čtvero ročních dob?', 'Antonio Vivaldi', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Franz Schubert'],
    ['Která skupina vydala album The Dark Side of the Moon?', 'Pink Floyd', 'Led Zeppelin', 'Deep Purple', 'Genesis'],
    ['Kdo složil operu Rusalka?', 'Antonín Dvořák', 'Bedřich Smetana', 'Leoš Janáček', 'Giuseppe Verdi'],
    ['Který zpěvák byl přezdíván Král rock’n’rollu?', 'Elvis Presley', 'Chuck Berry', 'Buddy Holly', 'Johnny Cash'],
    ['Kdo zpívá píseň Thriller?', 'Michael Jackson', 'Prince', 'Lionel Richie', 'Stevie Wonder'],
    ['Kdo složil operu Prodaná nevěsta?', 'Bedřich Smetana', 'Antonín Dvořák', 'Leoš Janáček', 'Zdeněk Fibich'],
    ['Který nástroj má běžně šest strun?', 'Kytara', 'Housle', 'Viola', 'Kontrabas'],
    ['Který nástroj se hraje smyčcem a drží pod bradou?', 'Housle', 'Violoncello', 'Kontrabas', 'Harfa'],
    ['Kdo zpívá píseň Someone Like You?', 'Adele', 'Duffy', 'Sia', 'Lana Del Rey'],
    ['Který skladatel ohluchl během života?', 'Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Frédéric Chopin', 'Joseph Haydn'],
    ['Kdo napsal hudbu k filmové trilogii Pán prstenů?', 'Howard Shore', 'John Williams', 'Hans Zimmer', 'James Horner'],
    ['Kdo nazpíval píseň Like a Prayer?', 'Madonna', 'Cher', 'Cyndi Lauper', 'Tina Turner'],
    ['Která skupina má hit Smells Like Teen Spirit?', 'Nirvana', 'Pearl Jam', 'Soundgarden', 'Green Day']
  ],
  Sport: [
    ['Kolik hráčů má fotbalový tým na hřišti při zahájení?', '11', '10', '9', '12'],
    ['Ve kterém sportu se používá puk?', 'Lední hokej', 'Pozemní hokej', 'Florbal', 'Lacrosse'],
    ['Který sport proslavil Petru Kvitovou?', 'Tenis', 'Badminton', 'Squash', 'Stolní tenis'],
    ['Který sport proslavil Usaina Bolta?', 'Sprint', 'Maraton', 'Plavání', 'Cyklistika'],
    ['Kolik bodů má koš zpoza trojkové čáry?', '3', '1', '2', '4'],
    ['Jak dlouhý je maraton v kilometrech?', '42,195', '40', '41,5', '45'],
    ['Který sport kombinuje běh na lyžích a střelbu?', 'Biatlon', 'Severská kombinace', 'Skialpinismus', 'Běh na lyžích'],
    ['Ve kterém sportu se používá fleret?', 'Šerm', 'Judo', 'Box', 'Karate'],
    ['Který sport se hraje na green s jamkami?', 'Golf', 'Kroket', 'Kriket', 'Baseball'],
    ['Kolik hráčů má volejbalové družstvo na hřišti?', '6', '5', '7', '8'],
    ['Kde se koná tenisový turnaj Wimbledon?', 'Londýn', 'Paříž', 'Melbourne', 'New York'],
    ['Jaký sport proslavil Michael Phelps?', 'Plavání', 'Atletika', 'Gymnastika', 'Veslování'],
    ['Ve kterém sportu se používá koště a kameny na ledě?', 'Curling', 'Lední hokej', 'Bandy', 'Rychlobruslení'],
    ['Kolik kruhů je na olympijské vlajce?', '5', '4', '6', '7'],
    ['Který český brankář vyhrál olympijské zlato v Naganu?', 'Dominik Hašek', 'Petr Čech', 'Tomáš Vokoun', 'Roman Čechmánek'],
    ['Který závod je součástí cyklistické Grand Tour?', 'Tour de France', 'Rallye Dakar', 'Le Mans', 'Monako Grand Prix'],
    ['Kolik setů musí tenista vyhrát v mužském grandslamovém zápase?', '3', '2', '4', '5'],
    ['Jaký sport proslavil Ester Ledeckou vedle lyžování?', 'Snowboarding', 'Biatlon', 'Krasobruslení', 'Skeleton'],
    ['Který sport má pozice nadhazovač a chytač?', 'Baseball', 'Kriket', 'Ragby', 'Házená'],
    ['Který sport využívá tatami a hody?', 'Judo', 'Šerm', 'Zápas ve volném stylu', 'Box'],
    ['Jak se nazývá maximální nához v bowlingu?', 'Strike', 'Spare', 'Birdie', 'Break'],
    ['Která země vyhrála fotbalové MS mužů v roce 2022?', 'Argentina', 'Francie', 'Brazílie', 'Chorvatsko'],
    ['Kolik disciplín tvoří desetiboj?', '10', '8', '9', '12'],
    ['Jak se jmenuje nejvyšší soutěž severoamerického basketbalu?', 'NBA', 'NHL', 'NFL', 'MLB']
  ],
  Příroda: [
    ['Kolik nohou má pavouk?', '8', '6', '10', '12'],
    ['Které zvíře má chobot?', 'Slon', 'Nosorožec', 'Hroch', 'Tapír'],
    ['Který pták žije v Antarktidě a nelétá?', 'Tučňák', 'Pštros', 'Emu', 'Kiwi'],
    ['Který savec dokáže aktivně létat?', 'Netopýr', 'Veverka', 'Vakoveverka', 'Lemur'],
    ['Které zvíře staví hráze?', 'Bobr', 'Vydra', 'Ondatra', 'Nutrie'],
    ['Jak se jmenuje larva motýla?', 'Housenka', 'Pulec', 'Larva komára', 'Nymfa'],
    ['Který strom má žaludy?', 'Dub', 'Buk', 'Javor', 'Jasan'],
    ['Který strom má nápadně bílou kůru?', 'Bříza', 'Lípa', 'Habr', 'Olše'],
    ['Které zvíře je největší žijící živočich?', 'Plejtvák obrovský', 'Kosatka', 'Slon africký', 'Žralok obrovský'],
    ['Jak se jmenuje mládě koně?', 'Hříbě', 'Tele', 'Jehně', 'Kůzle'],
    ['Který živočich prochází proměnou z pulce?', 'Žába', 'Ještěrka', 'Had', 'Želva'],
    ['Která část rostliny nasává vodu z půdy?', 'Kořen', 'Stonek', 'List', 'Květ'],
    ['Který živočich má tři srdce?', 'Chobotnice', 'Delfín', 'Žralok', 'Mořský koník'],
    ['Jak se jmenuje proces výroby cukrů ze světla u rostlin?', 'Fotosyntéza', 'Dýchání', 'Kvašení', 'Transpirace'],
    ['Který pták je nejrychlejší ve střemhlavém letu?', 'Sokol stěhovavý', 'Orel skalní', 'Rorýs obecný', 'Káně lesní'],
    ['Který savec klade vejce?', 'Ptakopysk', 'Koala', 'Vombat', 'Klokan'],
    ['Který orgán mají ryby k dýchání pod vodou?', 'Žábry', 'Plíce', 'Průdušnice', 'Vzdušnice'],
    ['Který strom je jehličnan?', 'Smrk', 'Buk', 'Dub', 'Javor'],
    ['Které zvíře mění barvu kůže pro maskování?', 'Chameleon', 'Leguán', 'Varan', 'Gekon'],
    ['Jak se jmenuje věda o houbách?', 'Mykologie', 'Botanika', 'Zoologie', 'Ekologie'],
    ['Který hmyz vyrábí med?', 'Včela medonosná', 'Vosa obecná', 'Sršeň obecná', 'Čmelák zemní'],
    ['Který z těchto živočichů je vačnatec?', 'Klokan', 'Lemur', 'Surikata', 'Lenochod'],
    ['Která skupina živočichů má peří?', 'Ptáci', 'Savci', 'Plazi', 'Obojživelníci'],
    ['Jak se nazývá oboustranně prospěšné soužití organismů?', 'Mutualismus', 'Parazitismus', 'Predace', 'Konkurence']
  ],
  Zeměpis: [
    ['Jaké je hlavní město Slovenska?', 'Bratislava', 'Košice', 'Žilina', 'Nitra'],
    ['Jaké je hlavní město Německa?', 'Berlín', 'Hamburk', 'Mnichov', 'Kolín nad Rýnem'],
    ['Jaké je hlavní město Francie?', 'Paříž', 'Lyon', 'Marseille', 'Nice'],
    ['Jaké je hlavní město Itálie?', 'Řím', 'Milán', 'Neapol', 'Turín'],
    ['Jaké je hlavní město Polska?', 'Varšava', 'Krakov', 'Gdaňsk', 'Vratislav'],
    ['Jaké je hlavní město Rakouska?', 'Vídeň', 'Salcburk', 'Štýrský Hradec', 'Linec'],
    ['Jaké je hlavní město Maďarska?', 'Budapešť', 'Debrecín', 'Segedín', 'Pécs'],
    ['Jaké je hlavní město Španělska?', 'Madrid', 'Barcelona', 'Valencie', 'Sevilla'],
    ['Jaké je hlavní město Portugalska?', 'Lisabon', 'Porto', 'Braga', 'Coimbra'],
    ['Jaké je hlavní město Řecka?', 'Atény', 'Soluň', 'Patras', 'Heraklion'],
    ['Jaké je hlavní město Norska?', 'Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
    ['Jaké je hlavní město Švédska?', 'Stockholm', 'Göteborg', 'Malmö', 'Uppsala'],
    ['Jaké je hlavní město Finska?', 'Helsinky', 'Turku', 'Tampere', 'Oulu'],
    ['Jaké je hlavní město Dánska?', 'Kodaň', 'Aarhus', 'Odense', 'Aalborg'],
    ['Jaké je hlavní město Japonska?', 'Tokio', 'Ósaka', 'Kjóto', 'Nagoja'],
    ['Jaké je hlavní město Egypta?', 'Káhira', 'Alexandrie', 'Gíza', 'Luxor'],
    ['Jaké je hlavní město Kanady?', 'Ottawa', 'Toronto', 'Montreal', 'Vancouver'],
    ['Jaké je hlavní město Austrálie?', 'Canberra', 'Sydney', 'Melbourne', 'Perth'],
    ['Jaké je hlavní město Brazílie?', 'Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'],
    ['Jaké je hlavní město České republiky?', 'Praha', 'Brno', 'Ostrava', 'Plzeň'],
    ['Která řeka protéká Paříží?', 'Seina', 'Loira', 'Rhôna', 'Garonna'],
    ['Které pohoří odděluje Evropu a Asii v Rusku?', 'Ural', 'Alpy', 'Pyreneje', 'Karpaty'],
    ['Která země má největší rozlohu na světě?', 'Rusko', 'Kanada', 'Čína', 'USA'],
    ['Jaké je hlavní město Nového Zélandu?', 'Wellington', 'Auckland', 'Christchurch', 'Hamilton']
  ],
  Historie: [
    ['Kdo byl prvním prezidentem Československa?', 'T. G. Masaryk', 'Edvard Beneš', 'Václav Havel', 'Emil Hácha'],
    ['Který český král je Otec vlasti?', 'Karel IV.', 'Václav IV.', 'Přemysl Otakar II.', 'Jiří z Poděbrad'],
    ['Ve kterém roce vzniklo Československo?', '1918', '1914', '1920', '1938'],
    ['Ve kterém roce skončila druhá světová válka v Evropě?', '1945', '1944', '1946', '1939'],
    ['Kdo byl upálen v Kostnici roku 1415?', 'Jan Hus', 'Jan Žižka', 'Jeronym Pražský', 'Prokop Holý'],
    ['Který vojevůdce vedl husity?', 'Jan Žižka', 'Karel IV.', 'Albrecht z Valdštejna', 'Jan Lucemburský'],
    ['Ve kterém roce proběhla sametová revoluce?', '1989', '1968', '1991', '1977'],
    ['Kdo byl prvním prezidentem České republiky?', 'Václav Havel', 'Václav Klaus', 'Miloš Zeman', 'Petr Pavel'],
    ['Který francouzský vojevůdce byl poražen u Waterloo?', 'Napoleon Bonaparte', 'Ludvík XIV.', 'Karel Veliký', 'Lafayette'],
    ['Kdo byl prvním člověkem na Měsíci?', 'Neil Armstrong', 'Buzz Aldrin', 'Jurij Gagarin', 'Alan Shepard'],
    ['Ve kterém roce přistáli lidé na Měsíci?', '1969', '1965', '1972', '1959'],
    ['Kdy se rozdělilo Československo?', '1993', '1989', '1991', '1995'],
    ['Která válka začala v roce 1914?', 'První světová válka', 'Druhá světová válka', 'Krymská válka', 'Sedmiletá válka'],
    ['Která egyptská královna byla spojena s Juliem Caesarem?', 'Kleopatra VII.', 'Hatšepsut', 'Nefertiti', 'Arsinoé II.'],
    ['Kdo vedl výpravu, která roku 1492 dorazila do Ameriky?', 'Kryštof Kolumbus', 'Vasco da Gama', 'Fernão de Magalhães', 'Amerigo Vespucci'],
    ['Kdo založil Karlovu univerzitu?', 'Karel IV.', 'Václav II.', 'Jan Lucemburský', 'Rudolf II.'],
    ['Ve kterém roce byla bitva na Bílé hoře?', '1620', '1618', '1648', '1609'],
    ['Kdo byl římským císařem v době požáru Říma roku 64?', 'Nero', 'Augustus', 'Traianus', 'Hadrianus'],
    ['Jak se jmenovala slavná anglická královna 16. století?', 'Alžběta I.', 'Viktorie', 'Marie II.', 'Anna Stuartovna'],
    ['Který dokument byl podepsán v Anglii roku 1215?', 'Magna charta', 'Zlatá bula sicilská', 'Vestfálský mír', 'Edikt nantský'],
    ['Kdo byl vůdcem sovětské revoluce v roce 1917?', 'Vladimir Lenin', 'Josif Stalin', 'Michail Gorbačov', 'Leonid Brežněv'],
    ['Která říše měla hlavní město Konstantinopol?', 'Byzantská říše', 'Římská republika', 'Franská říše', 'Perská říše'],
    ['Ve kterém roce padla Berlínská zeď?', '1989', '1987', '1991', '1979'],
    ['Kdo byl českým králem v bitvě u Kresčaku?', 'Jan Lucemburský', 'Karel IV.', 'Václav IV.', 'Přemysl Otakar I.']
  ],
  Jídlo: [
    ['Z čeho se vyrábí guacamole?', 'Avokádo', 'Okurka', 'Cuketa', 'Hrášek'],
    ['Jaké ovoce se nejčastěji používá do jablečného štrúdlu?', 'Jablko', 'Hruška', 'Broskev', 'Švestka'],
    ['Z jaké luštěniny se vyrábí hummus?', 'Cizrna', 'Čočka', 'Fazole', 'Hrách'],
    ['Z čeho se vyrábí tofu?', 'Sója', 'Pšenice', 'Kukuřice', 'Rýže'],
    ['Jaké ovoce se suší na rozinky?', 'Hrozny', 'Švestky', 'Meruňky', 'Fíky'],
    ['Jak se jmenuje italský pokrm z rýže?', 'Rizoto', 'Gnocchi', 'Polenta', 'Lasagne'],
    ['Který sýr se běžně používá na pizzu Margherita?', 'Mozzarella', 'Gouda', 'Eidam', 'Niva'],
    ['Která zelenina dává boršči červenou barvu?', 'Červená řepa', 'Rajče', 'Červená paprika', 'Červené zelí'],
    ['Jaká surovina je základem čokolády?', 'Kakao', 'Káva', 'Karob', 'Skořice'],
    ['Jak se jmenuje italský dezert s mascarpone a kávou?', 'Tiramisu', 'Panna cotta', 'Cannoli', 'Zabaglione'],
    ['Která obilovina se používá do ovesných vloček?', 'Oves', 'Ječmen', 'Žito', 'Pšenice'],
    ['Jaká zelenina je základem bramboráku?', 'Brambory', 'Cuketa', 'Mrkev', 'Batáty'],
    ['Jak se jmenuje omáčka z bazalky a olivového oleje?', 'Pesto', 'Salsa', 'Aioli', 'Bešamel'],
    ['Jaké ovoce je hlavní surovinou citronády?', 'Citron', 'Limetka', 'Pomeranč', 'Grapefruit'],
    ['Které koření barví kari často žlutě?', 'Kurkuma', 'Paprika', 'Skořice', 'Kmín'],
    ['Jak se jmenuje japonská polévka se sójovou pastou?', 'Miso', 'Ramen', 'Pho', 'Tom yum'],
    ['Která země je původem paelly?', 'Španělsko', 'Itálie', 'Portugalsko', 'Francie'],
    ['Jak se jmenuje francouzské pečivo ve tvaru půlměsíce?', 'Croissant', 'Bageta', 'Brioška', 'Madeleine'],
    ['Z čeho se vyrábí tradiční cider?', 'Jablka', 'Hrušky', 'Hrozny', 'Švestky'],
    ['Který sýr je typický pro řecký salát?', 'Feta', 'Mozzarella', 'Ricotta', 'Halloumi'],
    ['Jaký druh těstovin má tvar mašliček?', 'Farfalle', 'Penne', 'Fusilli', 'Rigatoni'],
    ['Jak se jmenuje korejské fermentované zelí?', 'Kimči', 'Miso', 'Tempeh', 'Natto'],
    ['Jaká luštěnina je základem falafelu v mnoha receptech?', 'Cizrna', 'Červená čočka', 'Hrách', 'Fazole'],
    ['Který dezert pochází z Rakouska a obsahuje čokoládový korpus a meruňkovou marmeládu?', 'Sachrův dort', 'Černý les', 'Tiramisu', 'Pavlova']
  ],
  Věda: [
    ['Která planeta je nejblíže Slunci?', 'Merkur', 'Venuše', 'Mars', 'Země'],
    ['Která planeta je známá jako rudá?', 'Mars', 'Jupiter', 'Venuše', 'Saturn'],
    ['Jaká je chemická značka zlata?', 'Au', 'Ag', 'Fe', 'Cu'],
    ['Jaká je chemická značka stříbra?', 'Ag', 'Au', 'Al', 'Ar'],
    ['Jaká je chemická značka železa?', 'Fe', 'F', 'Zn', 'Cu'],
    ['Kolik planet má Sluneční soustava?', '8', '7', '9', '10'],
    ['Jak se jmenuje naše galaxie?', 'Mléčná dráha', 'Andromeda', 'Trojúhelník', 'Velký Magellanův oblak'],
    ['Jak se jmenuje přirozená družice Země?', 'Měsíc', 'Titan', 'Europa', 'Ganymed'],
    ['Jaká síla přitahuje tělesa k Zemi?', 'Gravitace', 'Magnetismus', 'Tření', 'Vztlak'],
    ['Jak se nazývá přeměna vodní páry v kapalinu?', 'Kondenzace', 'Vypařování', 'Sublimace', 'Tání'],
    ['Který orgán pumpuje krev?', 'Srdce', 'Játra', 'Plíce', 'Ledviny'],
    ['Jak se nazývá základní stavební jednotka organismů?', 'Buňka', 'Tkáně', 'Orgán', 'Molekula'],
    ['Jaký přístroj měří teplotu?', 'Teploměr', 'Barometr', 'Vlhkoměr', 'Anemometr'],
    ['Jaký přístroj umožňuje pozorovat bakterie?', 'Mikroskop', 'Dalekohled', 'Periskop', 'Spektroskop'],
    ['Jaká je chemická značka kyslíku?', 'O', 'H', 'N', 'C'],
    ['Který plyn je nejvíce zastoupen v zemské atmosféře?', 'Dusík', 'Kyslík', 'Argon', 'Oxid uhličitý'],
    ['Jak se nazývá jednotka elektrického odporu?', 'Ohm', 'Volt', 'Ampér', 'Watt'],
    ['Jaká je jednotka elektrického proudu?', 'Ampér', 'Volt', 'Ohm', 'Joule'],
    ['Která část buňky obsahuje většinu DNA u člověka?', 'Jádro', 'Ribozom', 'Lysozom', 'Golgiho aparát'],
    ['Jak se nazývá částice se záporným elektrickým nábojem?', 'Elektron', 'Proton', 'Neutron', 'Foton'],
    ['Který vědec formuloval zákony pohybu?', 'Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'],
    ['Jak se nazývá přechod pevné látky přímo v plyn?', 'Sublimace', 'Kondenzace', 'Tání', 'Tuhnutí'],
    ['Která planeta má největší průměr ve Sluneční soustavě?', 'Jupiter', 'Saturn', 'Neptun', 'Uran'],
    ['Jaká je chemická značka sodíku?', 'Na', 'S', 'Si', 'Sn']
  ],
  Všeobecné: [
    ['Kolik dní má běžný rok?', '365', '364', '366', '360'],
    ['Kolik minut má hodina?', '60', '50', '90', '100'],
    ['Kolik měsíců má rok?', '12', '10', '11', '13'],
    ['Kolik dní má týden?', '7', '5', '6', '8'],
    ['Kolik stran má trojúhelník?', '3', '4', '5', '6'],
    ['Kolik stran má čtverec?', '4', '3', '5', '6'],
    ['Jaká barva vznikne smícháním modré a žluté barvy?', 'Zelená', 'Fialová', 'Oranžová', 'Hnědá'],
    ['Kolik centimetrů má metr?', '100', '10', '1000', '60'],
    ['Kolik metrů má kilometr?', '1000', '100', '10000', '500'],
    ['Kdo napsal knihu Babička?', 'Božena Němcová', 'Karolina Světlá', 'Eliška Krásnohorská', 'Marie Majerová'],
    ['Kdo napsal Romea a Julii?', 'William Shakespeare', 'Charles Dickens', 'Oscar Wilde', 'George Orwell'],
    ['Jaká je nejvyšší hora České republiky?', 'Sněžka', 'Praděd', 'Lysá hora', 'Klínovec'],
    ['Která řeka protéká Prahou?', 'Vltava', 'Labe', 'Morava', 'Odra'],
    ['Jaký jazyk je úřední v Brazílii?', 'Portugalština', 'Španělština', 'Francouzština', 'Italština'],
    ['Kolik hodin má den?', '24', '12', '20', '25'],
    ['Který měsíc následuje po srpnu?', 'Září', 'Říjen', 'Červenec', 'Listopad'],
    ['Jaký je symbol chemického prvku v periodické tabulce pro vodu?', 'Žádný', 'H₂O', 'HO', 'OH'],
    ['Kdo napsal Malého prince?', 'Antoine de Saint-Exupéry', 'Jules Verne', 'Victor Hugo', 'Albert Camus'],
    ['Jaké číslo se píše římsky jako X?', '10', '5', '50', '100'],
    ['Který český spisovatel napsal R.U.R.?', 'Karel Čapek', 'Josef Čapek', 'Jaroslav Hašek', 'Bohumil Hrabal'],
    ['Jak se jmenuje nejvyšší české pohoří?', 'Krkonoše', 'Šumava', 'Jeseníky', 'Beskydy'],
    ['Jaké číslo se píše římsky jako L?', '50', '10', '100', '500'],
    ['Kdo napsal knihu Osudy dobrého vojáka Švejka?', 'Jaroslav Hašek', 'Karel Čapek', 'Vladislav Vančura', 'Jan Neruda'],
    ['Jak se jmenuje česká měna?', 'Koruna česká', 'Euro', 'Zlotý', 'Forint']
  ]
};

const arithmetic = [
  [7,8,'+'],[12,9,'+'],[25,17,'+'],[36,14,'+'],
  [45,28,'+'],[20,7,'−'],[34,16,'−'],[60,25,'−'],
  [91,38,'−'],[100,64,'−'],[3,7,'×'],[6,8,'×'],
  [9,9,'×'],[12,4,'×'],[7,11,'×'],[36,6,'÷'],
  [56,7,'÷'],[81,9,'÷'],[100,4,'÷'],[144,12,'÷'],
  [19,27,'+'],[86,49,'−'],[13,7,'×'],[225,15,'÷'],
  [17,18,'+'],[200,75,'−'],[14,9,'×'],[169,13,'÷'],
  [48,37,'+'],[15,12,'×'],[432,12,'÷'],[999,101,'−'],
  [23,19,'×'],[625,25,'÷'],[125,175,'+'],[504,18,'÷']
];

data.Matematika = [];

for (const [a,b,op] of arithmetic) {
  const n = op === '+' ? a+b
    : op === '−' ? a-b
    : op === '×' ? a*b : a/b;

  const offsets = n < 20 ? [1,2,3]
    : n < 100 ? [2,5,10] : [10,20,30];

  const opts = [
    String(n),
    ...offsets.map((d,i) => String(n + (i === 1 ? -d : d)))
  ];

  data.Matematika.push([`Kolik je ${a} ${op} ${b}?`, ...opts]);
}

const questions = [];

for (const category of categories) {
  data[category].forEach((row, i) => {
    const difficulty = i < 8 ? 'Lehká'
      : i < 16 ? 'Střední' : 'Těžká';

    const options = shuffle(row.slice(1));

    questions.push({
      id: `${category}-${i}`,
      category,
      difficulty,
      text: row[0],
      options,
      correct: options.indexOf(row[1])
    });
  });
}

function makeRoomCode() {
  let c;
  do {
    c = String(crypto.randomInt(100000,1000000));
  } while (rooms.has(c));
  return c;
}

function chooseGame(r) {
  const pool = questions.filter(q => q.difficulty === r.difficulty);
  const chosen = [];
  const per = Math.floor(r.limit / categories.length);

  for (const category of categories) {
    const available = pool.filter(q => q.category === category);
    let fresh = available.filter(q => !r.seen.has(q.id));

    if (fresh.length < per) {
      for (const q of available) r.seen.delete(q.id);
      fresh = available;
    }

    chosen.push(...shuffle(fresh).slice(0, per));
  }

  const selected = new Set(chosen.map(q => q.id));

  chosen.push(
    ...shuffle(pool.filter(q => !selected.has(q.id)))
      .slice(0, r.limit - chosen.length)
  );

  for (const q of chosen) r.seen.add(q.id);

  const custom = shuffle(r.customQuestions || [])
    .slice(0, Math.min(4, chosen.length));

  for (let i = 0; i < custom.length; i++) {
    chosen[i] = custom[i];
  }

  r.gameQuestions = shuffle(chosen);
  r.index = 0;
  r.active = null;
  r.phase = 'lobby';
  r.winner = null;
  r.attempts = new Map();
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
      .sort((a,b) =>
        b.score - a.score || a.name.localeCompare(b.name, 'cs')
      ),
    question: r.active ? {
      id: r.active.id,
      text: r.active.text,
      options: r.active.options,
      category: r.active.category,
      difficulty: r.active.difficulty,
      bonus: r.index === Math.ceil(r.limit / 2)
    } : null,
    winner: r.winner,
    answer: ['result','finished'].includes(r.phase)
      ? r.active?.correct : null,
    used: r.index,
    total: r.limit,
    finished: r.phase === 'finished',
    hostConnected: r.hostConnected,
    hostPlaying: !!r.hostPlayerId,
    difficulty: r.difficulty
  };
}

function emit(r) {
  io.to(r.code).emit('state', state(r));
}

function reply(cb, value) {
  if (typeof cb === 'function') cb(value);
}

function authorized(s) {
  const r = rooms.get(s.data?.code);
  return r && r.host === s.id ? r : null;
}

function finish(r) {
  r.phase = r.index >= r.limit ? 'finished' : 'result';
}

function attachHost(s,r) {
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

  s.on('create', (data,cb) => {
    const limit = [20,30,40].includes(Number(data?.limit))
      ? Number(data.limit) : 20;

    const difficulty = ['Lehká','Střední','Těžká']
      .includes(data?.difficulty)
      ? data.difficulty : 'Střední';

    const code = makeRoomCode();

    const r = {
      code,
      limit,
      difficulty,
      host: s.id,
      hostToken: crypto.randomUUID(),
      hostConnected: true,
      hostPlayerId: null,
      players: new Map(),
      seen: new Set(),
      customQuestions: []
    };

    chooseGame(r);
    rooms.set(code,r);
    attachHost(s,r);

    reply(cb, {
      ok: true,
      code,
      hostToken: r.hostToken
    });
  });

  s.on('resumeHost', (data,cb) => {
    const r = rooms.get(clean(data?.code));

    if (!r || !data?.hostToken ||
        data.hostToken !== r.hostToken) {
      return reply(cb, {
        error: 'Původní místnost už není dostupná. Založ novou hru.'
      });
    }

    if (r.host && r.host !== s.id) {
      const old = io.sockets.sockets.get(r.host);

      if (old) {
        old.leave(r.code);
        old.data = {};
        old.emit(
          'notice',
          'Moderátorka se připojila na jiném zařízení.'
        );
      }
    }

    attachHost(s,r);
    reply(cb,{ok:true});
  });

  s.on('join', (data,cb) => {
    const code = clean(data?.code);
    const name = clean(data?.name);
    const r = rooms.get(code);

    if (!r) {
      return reply(cb,{error:'Místnost neexistuje.'});
    }

    if (!name) {
      return reply(cb,{error:'Zadej přezdívku.'});
    }

    const t = clean(data?.token);
    let p = t && r.players.get(t);

    if (!p) {
      if ([...r.players.values()].some(x =>
        x.name.toLowerCase() === name.toLowerCase()
      )) {
        return reply(cb,{
          error:'Přezdívka už je obsazená.'
        });
      }

      p = {
        id:crypto.randomUUID(),
        name,
        score:0,
        connected:true,
        socket:s.id
      };

      r.players.set(p.id,p);
    } else {
      p.connected = true;
      p.socket = s.id;
    }

    s.join(code);
    s.data = {
      code,
      role:'player',
      playerId:p.id
    };

    reply(cb,{ok:true,token:p.id});
    emit(r);
  });

  s.on('hostPlay', (data,cb) => {
    const r = authorized(s);

    if (!r) {
      return reply(cb,{
        error:'Jen moderátorka může hrát za sebe.'
      });
    }

    if (r.hostPlayerId) {
      return reply(cb,{ok:true});
    }

    const name = clean(data?.name) || 'Moderátorka';

    if ([...r.players.values()].some(p =>
      p.name.toLowerCase() === name.toLowerCase()
    )) {
      return reply(cb,{
        error:'Přezdívka už je obsazená.'
      });
    }

    const p = {
      id:crypto.randomUUID(),
      name,
      score:0,
      connected:true,
      socket:s.id
    };

    r.hostPlayerId = p.id;
    r.players.set(p.id,p);

    reply(cb,{ok:true});
    emit(r);
  });

  s.on('next', (_,cb) => {
    const r = authorized(s);

    if (!r) {
      return reply(cb,{error:'Nemáš oprávnění.'});
    }

    if (r.phase === 'question') {
      return reply(cb,{
        error:'Nejdřív dokonči aktuální otázku.'
      });
    }

    if (r.phase === 'finished') {
      return reply(cb,{
        error:'Hra skončila. Zvol Nová hra.'
      });
    }

    if (r.index >= r.limit) {
      r.phase = 'finished';
      emit(r);
      return reply(cb,{error:'Hra skončila.'});
    }

    r.active = r.gameQuestions[r.index++];
    r.attempts = new Map();
    r.winner = null;
    r.phase = 'question';

    reply(cb,{ok:true});
    emit(r);
  });

  s.on('answer', (index,cb) => {
    const r = rooms.get(s.data?.code);

    const id = s.data?.role === 'host'
      ? r?.hostPlayerId : s.data?.playerId;

    const p = r?.players.get(id);

    if (!r || !p ||
        (s.data?.role === 'host'
          ? r.host !== s.id
          : p.socket !== s.id) ||
        r.phase !== 'question') {
      return reply(cb,{
        error:'Otázka už není aktivní.'
      });
    }

    if (!Number.isInteger(index) ||
        index < 0 || index > 3) {
      return reply(cb,{
        error:'Neplatná odpověď.'
      });
    }

    const tried = r.attempts.get(id) || new Set();

    if (tried.has(index)) {
      return reply(cb,{
        error:'Tuto možnost už jsi zkusila.'
      });
    }

    tried.add(index);
    r.attempts.set(id,tried);

    if (index === r.active.correct) {
      const points = r.index === Math.ceil(r.limit / 2)
        ? 2 : 1;

      p.score += points;

      r.winner = {
        name:p.name,
        id:p.id,
        points
      };

      finish(r);
      reply(cb,{ok:true,correct:true,points});
      emit(r);
    } else {
      reply(cb,{ok:true,correct:false});
    }
  });

  s.on('reveal', (_,cb) => {
    const r = authorized(s);

    if (!r) {
      return reply(cb,{error:'Nemáš oprávnění.'});
    }

    if (r.phase === 'question') {
      r.winner = null;
      finish(r);
      emit(r);
    }

    reply(cb,{ok:true});
  });

  s.on('reset', (_,cb) => {
    const r = authorized(s);

    if (!r) {
      return reply(cb,{error:'Nemáš oprávnění.'});
    }

    chooseGame(r);

    for (const p of r.players.values()) {
      p.score = 0;
    }

    reply(cb,{ok:true});
    emit(r);
  });

  s.on('addQuestion', (data,cb) => {
    const r = authorized(s);

    if (!r) {
      return reply(cb,{
        error:'Jen moderátorka může přidávat otázky.'
      });
    }

    const text = clean(data?.text);
    const options = Array.isArray(data?.options)
      ? data.options.map(clean) : [];
    const correct = Number(data?.correct);

    if (!text ||
        options.length !== 4 ||
        options.some(x => !x) ||
        new Set(options).size !== 4 ||
        !Number.isInteger(correct) ||
        correct < 0 || correct > 3) {
      return reply(cb,{
        error:'Vyplň otázku a čtyři různé odpovědi.'
      });
    }

    const q = {
      id:crypto.randomUUID(),
      category:'Vlastní',
      difficulty:r.difficulty,
      text,
      options,
      correct
    };

    r.customQuestions.push(q);
    reply(cb,{ok:true});
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

server.listen(
  process.env.PORT || 3000,
  () => console.log(
    'KVÍZ ARÉNA: ' + questions.length + ' otázek, server běží'
  )
);
