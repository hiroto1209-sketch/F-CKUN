(() => {
  'use strict';
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>[...root.querySelectorAll(s)];

  const boot=$('#boot'), bar=$('#bootBar'), status=$('#bootStatus');
  const bootSteps=[[18,'LOADING ATTITUDE...'],[44,'PIXELS LOCKED.'],[72,'ROOM ONLINE.'],[100,'HE IS AWAKE.']];
  let bi=0; const bootTimer=setInterval(()=>{ const [n,txt]=bootSteps[bi++]; bar.style.width=n+'%';status.textContent=txt;if(bi===bootSteps.length){clearInterval(bootTimer);setTimeout(()=>boot.classList.add('is-done'),360)} },210);
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.13});
  $$('.reveal').forEach(el=>io.observe(el));
  addEventListener('scroll',()=>$('#nav').classList.toggle('scrolled',scrollY>18),{passive:true});

  const sf=$('#starfield'), sx=sf.getContext('2d'); let SW=0,SH=0,starsBg=[];
  function sizeStars(){const d=Math.min(devicePixelRatio||1,2);SW=innerWidth;SH=innerHeight;sf.width=SW*d;sf.height=SH*d;sx.setTransform(d,0,0,d,0,0);starsBg=Array.from({length:Math.min(90,Math.floor(SW*SH/15000))},()=>({x:Math.random()*SW,y:Math.random()*SH,s:Math.random()*1.3+.3,v:Math.random()*.12+.02}))}
  addEventListener('resize',sizeStars,{passive:true});sizeStars();
  function paintStars(){sx.clearRect(0,0,SW,SH);sx.fillStyle='#eee7dc';for(const p of starsBg){p.y+=p.v;if(p.y>SH)p.y=0;sx.globalAlpha=.15+Math.random()*.3;sx.fillRect(p.x,p.y,p.s,p.s)}sx.globalAlpha=1;requestAnimationFrame(paintStars)}paintStars();

  let audio=null,sound=false;
  function tone(freq=440,dur=.07,type='square',gain=.025){if(!sound)return;try{audio ||= new (AudioContext||webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.value=gain;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.stop(audio.currentTime+dur)}catch(e){}}
  $('#soundToggle').addEventListener('click',e=>{sound=!sound;e.currentTarget.querySelector('b').textContent=sound?'ON':'OFF';if(sound)tone(520,.08)});

  const KEY='fckun.pet.v2'; const now=()=>Date.now();
  const fresh={food:82,love:76,energy:84,coins:120,day:1,sleeping:false,lastSeen:now(),daily:0,bornAt:now()};
  let pet={...fresh};
  try{pet={...fresh,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){}
  function clamp(v){return Math.max(0,Math.min(100,v))}
  function elapsedUpdate(){const mins=Math.max(0,Math.min((now()-pet.lastSeen)/60000,1440)); if(pet.sleeping){pet.energy=clamp(pet.energy+mins*.35);pet.food=clamp(pet.food-mins*.08)}else{pet.food=clamp(pet.food-mins*.13);pet.love=clamp(pet.love-mins*.045);pet.energy=clamp(pet.energy-mins*.07)}pet.day=Math.max(1,Math.floor((now()-pet.bornAt)/86400000)+1);pet.lastSeen=now()}
  elapsedUpdate();
  function save(){pet.lastSeen=now();try{localStorage.setItem(KEY,JSON.stringify(pet))}catch(e){}}
  addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});

  function mood(){const avg=(pet.food+pet.love+pet.energy)/3;if(pet.sleeping)return['SLEEPING','- . -'];if(avg<20)return['ROUGH','x_x'];if(pet.food<28)return['HUNGRY','-_-'];if(pet.energy<25)return['TIRED','- . -'];if(pet.love>88&&avg>70)return['LOVED','^_^'];if(avg>75)return['GOOD','-‿-'];return['CHILL','-_-']}
  function updateUI(){const [m,face]=mood();$('#moodText').textContent=m;$('#moodEmoji').textContent=face;$('#heroMood').textContent=m;['food','love','energy'].forEach(k=>{$('#'+k+'Val').textContent=Math.round(pet[k]);$('#'+k+'Bar').style.width=pet[k]+'%'});$('#coinsVal').textContent=pet.coins;$('#dayLabel').textContent='DAY '+String(pet.day).padStart(3,'0');$('#sleepLabel').textContent=pet.sleeping?'WAKE':'SLEEP';$('#zzz').classList.toggle('show',pet.sleeping);const claimed=new Date(pet.daily).toDateString()===new Date().toDateString();$('#giftLabel').textContent=claimed?'CLAIMED TODAY':'CLAIM +15 ★';$('[data-action="gift"]').disabled=claimed}
  updateUI();

  const PAL={O:'#050505',S:'#f2d9ae',S2:'#c7a16f',W:'#f0ede7',SH:'#c7c0b6',B:'#18181b',D:'#28282b'};
  let tick=0,anim='idle',animUntil=0,blink=false;
  function drawPet(canvas,mode='live'){
    const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);
    const scale=18, ox=14, oy=12; let dx=0,dy=0,rot=0;
    const live=mode==='live'; const current=performance.now()<animUntil?anim:(pet.sleeping?'sleep':'idle');
    if(live){ if(current==='idle')dy=Math.sin(tick*.055)*1.1;if(current==='play'){dx=Math.sin(tick*.32)*2.2;dy=-Math.abs(Math.sin(tick*.17))*4}if(current==='pet')dy=-2;if(current==='feed')dy=Math.sin(tick*.45)*1.2;if(current==='wake')dy=-Math.abs(Math.sin(tick*.13))*2.5;if(current==='sleep')rot=-.02 }
    c.save();c.translate(ox+dx*scale/3,oy+dy*scale/3);c.rotate(rot);
    const q=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(a*scale),Math.round(b*scale),w*scale,h*scale)};
    q(5,0,4,12,PAL.O);q(6,0,2,11,PAL.S);
    q(1,6,4,8,PAL.O);q(2,7,2,6,PAL.S);q(3,4,3,10,PAL.O);q(4,5,1,8,PAL.S);q(8,5,3,9,PAL.O);q(9,6,1,7,PAL.S);q(10,8,4,5,PAL.O);q(10,9,3,3,PAL.S);
    q(2,10,10,5,PAL.O);q(3,10,8,4,PAL.S);q(3,13,8,2,PAL.O);q(4,13,6,1,PAL.S2);
    q(4,11,2,1,PAL.O);q(8,11,2,1,PAL.O);if(!pet.sleeping&&!blink){q(5,12,1,1,PAL.O);q(9,12,1,1,PAL.O)}
    const sad=mood()[0]==='ROUGH'; if(sad){q(5,14,1,1,PAL.O);q(6,13,3,1,PAL.O);q(9,14,1,1,PAL.O)}else{q(5,13,1,1,PAL.O);q(6,14,3,1,PAL.O);q(9,13,1,1,PAL.O)}
    q(5,15,4,2,PAL.O);q(6,15,2,1,PAL.S2);
    q(3,16,8,7,PAL.O);q(2,17,2,5,PAL.O);q(10,17,2,5,PAL.O);q(4,16,6,6,PAL.W);q(3,17,1,4,PAL.W);q(10,17,1,4,PAL.W);q(5,21,5,1,PAL.SH);
    q(2,21,2,3,PAL.O);q(3,21,1,2,PAL.S);q(10,21,2,3,PAL.O);q(10,21,1,2,PAL.S);
    q(4,22,7,5,PAL.O);q(4,22,3,5,PAL.B);q(8,22,3,5,PAL.D);q(4,26,3,2,PAL.O);q(8,26,3,2,PAL.O);q(3,27,4,2,PAL.W);q(8,27,4,2,PAL.W);q(4,27,2,1,PAL.SH);q(9,27,2,1,PAL.SH);
    c.restore();
  }
  const heroPet=$('#heroPet'),petCanvas=$('#petCanvas'),profilePet=$('#profilePet');
  function animate(){tick++;drawPet(heroPet,'hero');drawPet(petCanvas,'live');drawPet(profilePet,'profile');requestAnimationFrame(animate)}animate();
  setInterval(()=>{blink=true;setTimeout(()=>blink=false,150)},3300);

  let sayTimer;function say(text){const s=$('#speech');s.textContent=text;s.classList.add('show');clearTimeout(sayTimer);sayTimer=setTimeout(()=>s.classList.remove('show'),1500)}
  function pop(chars=['♥','✦'],count=5){for(let i=0;i<count;i++){const d=document.createElement('i');d.className='pop';d.textContent=chars[Math.floor(Math.random()*chars.length)];d.style.setProperty('--x',(Math.random()*110-55)+'px');d.style.left=(45+Math.random()*10)+'%';$('#particles').appendChild(d);setTimeout(()=>d.remove(),950)}}
  function setAnim(name,ms=850){anim=name;animUntil=performance.now()+ms}
  const lines={pet:['…悪くない。','そこ。','もう一回。','へへ。'],play:['まだいける。','勝つまでやる。','まあまあ。'],feed:['うまい。','それ好き。','あと一個。'],poor:['★ 足りない。'],tired:['今日はむり。','ちょい休む。']};
  function random(arr){return arr[Math.floor(Math.random()*arr.length)]}
  function interact(type){
    if(type!=='sleep'&&type!=='gift'&&pet.sleeping){say('Zzz...');tone(160,.08);return}
    if(type==='feed'){if(pet.coins<5){say(random(lines.poor));return}pet.coins-=5;pet.food=clamp(pet.food+22);pet.love=clamp(pet.love+2);setAnim('feed',1000);say(random(lines.feed));pop(['✦'],3);tone(520,.06)}
    if(type==='pet'){pet.love=clamp(pet.love+8);setAnim('pet',800);say(random(lines.pet));pop(['♥','✦'],6);tone(660,.05)}
    if(type==='play'){if(pet.energy<12){say(random(lines.tired));return}pet.energy=clamp(pet.energy-12);pet.love=clamp(pet.love+15);pet.coins+=3;setAnim('play',1300);say(random(lines.play));pop(['✦'],7);tone(740,.05);setTimeout(()=>tone(980,.05),70)}
    if(type==='sleep'){pet.sleeping=!pet.sleeping;if(pet.sleeping){say('おやすみ。');setAnim('sleep',999999);tone(260,.12)}else{pet.energy=clamp(pet.energy+6);say('おはよう。');setAnim('wake',900);tone(520,.08)}}
    if(type==='gift'){const today=new Date().toDateString();if(new Date(pet.daily).toDateString()===today)return;pet.daily=now();pet.coins+=15;say('★ もらっとく。');pop(['★','✦'],10);tone(880,.07);setTimeout(()=>tone(1170,.08),90)}
    updateUI();save();
  }
  $$('.petAction').forEach(b=>b.addEventListener('click',()=>interact(b.dataset.action)));
  petCanvas.addEventListener('pointerdown',e=>{e.preventDefault();interact('pet')});
  heroPet.addEventListener('pointerdown',e=>{e.preventDefault();setAnim('play',900);pop(['✦'],5);tone(620,.05);$('#heroMood').textContent='HEY.';setTimeout(()=>updateUI(),900)});
  $('#heroTap').addEventListener('click',()=>heroPet.dispatchEvent(new PointerEvent('pointerdown')));

  setInterval(()=>{if(pet.sleeping){pet.energy=clamp(pet.energy+1.8);pet.food=clamp(pet.food-.22)}else{pet.food=clamp(pet.food-.42);pet.love=clamp(pet.love-.12);pet.energy=clamp(pet.energy-.22)}updateUI();save()},15000);

  const h=new Date().getHours();if(h>=6&&h<18){$('.room__window').style.background='linear-gradient(#7b8492,#c5baa2)';$('#roomMoon').textContent='✦'}
  $('#lastSeen').textContent='AUTO SAVE / '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
})();
