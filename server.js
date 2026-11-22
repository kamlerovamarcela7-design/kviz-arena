const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const path=require('path');
const app=express();const server=http.createServer(app);const io=new Server(server);
app.use(express.static(path.join(__dirname,'public')));
const rooms=new Map();
const seed=[
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
].map(([text,options,correct,category],i)=>({id:'s'+i,text,options,correct,category}));
const code=()=>{let c;do{c=String(Math.floor(100000+Math.random()*900000))}while(rooms.has(c));return c};
const clean=s=>String(s||'').trim().slice(0,60);
function state(r){return {code:r.code,phase:r.phase,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,score:p.score,connected:p.connected})).sort((a,b)=>b.score-a.score),question:r.active?{text:r.active.text,options:r.active.options,category:r.active.category}:null,winner:r.winner,answer:r.phase==='result'?r.active?.correct:null,used:r.used.size,hostConnected:r.hostConnected}}
function emit(r){io.to(r.code).emit('state',state(r))}
function reply(cb,data){if(typeof cb==='function')cb(data)}
io.on('connection',s=>{
 s.on('create',(_,cb)=>{const c=code();const r={code:c,host:s.id,hostConnected:true,players:new Map(),questions:[...seed],used:new Set(),phase:'lobby',active:null,winner:null};rooms.set(c,r);s.join(c);s.data={code:c,role:'host'};reply(cb,{ok:true,code:c});emit(r)});
 s.on('join',(data,cb)=>{const c=clean(data?.code),name=clean(data?.name);const r=rooms.get(c);if(!r)return reply(cb,{error:'Místnost neexistuje.'});if(!name)return reply(cb,{error:'Zadej přezdívku.'});const token=clean(data?.token);let p=token&&r.players.get(token);if(!p){if([...r.players.values()].some(x=>x.name.toLowerCase()===name.toLowerCase()))return reply(cb,{error:'Přezdívka už je obsazená.'});const id=require('crypto').randomUUID();p={id,name,score:0,connected:true,socket:s.id};r.players.set(id,p)}else{p.connected=true;p.socket=s.id}s.join(c);s.data={code:c,role:'player',playerId:p.id};reply(cb,{ok:true,token:p.id});emit(r)});
 s.on('addQuestion',(data,cb)=>{const r=rooms.get(s.data?.code);if(!r||r.host!==s.id)return reply(cb,{error:'Jen moderátorka může přidávat otázky.'});const text=clean(data?.text),options=(data?.options||[]).map(clean),correct=Number(data?.correct);if(!text||options.length!==4||options.some(x=>!x)||!Number.isInteger(correct)||correct<0||correct>3)return reply(cb,{error:'Vyplň otázku, čtyři odpovědi a správnou možnost.'});r.questions.push({id:require('crypto').randomUUID(),text,options,correct,category:'Vlastní'});reply(cb,{ok:true});emit(r)});
 s.on('next',(_,cb)=>{const r=rooms.get(s.data?.code);if(!r||r.host!==s.id)return reply(cb,{error:'Nemáš oprávnění.'});const available=r.questions.filter(q=>!r.used.has(q.id));if(!available.length)return reply(cb,{error:'Všechny otázky byly použity. Dej Nová hra.'});const q=available[Math.floor(Math.random()*available.length)];r.used.add(q.id);r.active=q;r.phase='question';r.winner=null;reply(cb,{ok:true});emit(r)});
 s.on('answer',(index,cb)=>{const r=rooms.get(s.data?.code),p=r?.players.get(s.data?.playerId);if(!r||!p||p.socket!==s.id||r.phase!=='question')return reply(cb,{error:'Otázka už není aktivní.'});if(!Number.isInteger(index)||index<0||index>3)return reply(cb,{error:'Neplatná odpověď.'});if(index===r.active.correct){r.phase='result';r.winner={name:p.name,id:p.id};p.score++;reply(cb,{ok:true,correct:true});emit(r)}else reply(cb,{ok:true,correct:false})});
 s.on('reveal',(_,cb)=>{const r=rooms.get(s.data?.code);if(!r||r.host!==s.id)return reply(cb,{error:'Nemáš oprávnění.'});if(r.phase==='question'){r.phase='result';r.winner=null;emit(r)}reply(cb,{ok:true})});
 s.on('reset',(_,cb)=>{const r=rooms.get(s.data?.code);if(!r||r.host!==s.id)return reply(cb,{error:'Nemáš oprávnění.'});r.used.clear();r.phase='lobby';r.active=null;r.winner=null;for(const p of r.players.values())p.score=0;reply(cb,{ok:true});emit(r)});
 s.on('disconnect',()=>{const r=rooms.get(s.data?.code);if(!r)return;if(s.data.role==='host'&&r.host===s.id){r.hostConnected=false;io.to(r.code).emit('notice','Moderátorka se odpojila.');setTimeout(()=>{if(rooms.get(r.code)===r&&!r.hostConnected){rooms.delete(r.code);io.to(r.code).emit('notice','Místnost byla uzavřena.')}},60000)}else if(s.data.role==='player'){const p=r.players.get(s.data.playerId);if(p&&p.socket===s.id)p.connected=false}emit(r)});
});
server.listen(process.env.PORT||3000,()=>console.log('KVÍZ ARÉNA běží na portu '+(process.env.PORT||3000)));
