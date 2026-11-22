// ============================================================
//  TACOMPTON, neighborhood pack: Fern Hill (South Tacoma, around S 84th St and Park Ave; a 22-minute bus ride).
//  The Park Ave business district (invented shops), the Fern Hill library branch (Tacoma Public Library) and a neighborhood
//  community garden and playfield (invented). Prefix fh_. Registers itself with defHood() (20-world.js).
// ============================================================
(function(){
const KEY='fernhill';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`${KEY}_${k}_${day()}`], mark=k=>{HF()[`${KEY}_${k}_${day()}`]=true};
const brick=n=>n?'#40251f':'#b0604a', wood=n=>n?'#3a3128':'#d9c9a0';
const nb=id=>NEIGHBORS.find(x=>x.id===id);
const meet=id=>{const x=!S.met[id];if(x){S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2)}return x};

defHood({
  key:KEY, name:'Fern Hill', ic:'🌿', blurb:'One of the oldest corners of South Tacoma: quiet streets of older homes, a little business district at S 84th and Park Ave, and a library with a garden out back.',
  hub:'fh_main', ride:{via:'🚌 Bus', mins:22, fare:2},
  places:{
    fh_main:{name:'Park Ave shops',ic:'🍳',desc:'A short strip near S 84th and Park Ave: a family diner and a thrift shop, both invented, both beloved',
      hours:d=>d%7<6?[360,1080]:[420,840],
      art:({night:n})=>`${starsSky(n)}
        ${tree(28,n,18,140)}${tree(456,n,16,140)}
        ${[['HAZEL’S DINER','#c0392b',58,n?'#4a2e26':'#e0b878'],['SECOND WIND THRIFT','#2f6b4a',244,n?'#32343d':'#c9b99a']].map(([t,c,x,w],i)=>`
          <rect x="${x}" y="52" width="178" height="88" fill="${w}"/>
          <rect x="${x-3}" y="48" width="184" height="6" fill="${n?'#2a1e1a':'#6a3f2e'}"/>
          <rect x="${x+14}" y="57" width="150" height="14" rx="2" fill="${n?'#1c1814':'#2a1e18'}"/><text x="${x+89}" y="68" text-anchor="middle" font-size="8.5" ${SVGF} fill="#f4e2a8">${t}</text>
          <path d="M${x} 76 h178 l-6 12 h-166 z" fill="${c}"/>${[0,1,2,3,4,5,6,7,8,9].map(k=>`<rect x="${x+4+k*17}" y="76" width="9" height="12" fill="#fff" opacity=".28"/>`).join('')}
          <rect x="${x+10}" y="94" width="96" height="36" fill="${win(n,true)}"/><rect x="${x+122}" y="94" width="42" height="46" fill="${n?'#241a14':'#4a3226'}"/>
          ${i===0?`<rect x="${x+16}" y="118" width="84" height="4" fill="#6b4430"/>${[0,1,2,3].map(k=>`<circle cx="${x+28+k*22}" cy="124" r="4" fill="#c0392b"/>`).join('')}<circle cx="${x+60}" cy="108" r="6" fill="${n?'#7a5a3a':'#f4efe4'}"/>`
            :`<rect x="${x+18}" y="100" width="10" height="24" fill="#7a3b6e" opacity=".75"/><rect x="${x+34}" y="104" width="22" height="20" fill="#c98a12" opacity=".75"/><path d="M${x+64} 100 l10 -6 l10 6 v22 h-20 z" fill="#2a6fa8" opacity=".7"/><rect x="${x+90}" y="108" width="12" height="16" fill="#e74c8c" opacity=".7"/>`}`).join('')}
        ${person(212,n,'#2a6fa8',146,.95)}${person(430,n,'#8e44ad',146,.95)}${lamp(36,n,146)}${lamp(236,n,146)}
        <rect y="146" width="480" height="4" fill="${HC.walk(n)}"/>`},
    fh_library:{name:'Fern Hill Library',ic:'📚',desc:'A branch of the Tacoma Public Library, tucked among the neighborhood’s older homes, with a children’s corner and big windows',
      hours:d=>d%7===6?null:d%7===5?[600,1020]:[600,1200],
      art:({night:n})=>`${starsSky(n)}
        <rect y="124" width="480" height="26" fill="${n?'#1a2a22':'#7aa57e'}"/>
        ${tree(40,n,26,140)}${tree(92,n,20,140)}${tree(438,n,26,140)}${tree(392,n,20,140)}
        <rect x="130" y="70" width="220" height="62" fill="${brick(n)}"/>
        <polygon points="120,72 240,34 360,72" fill="${n?'#2c3644':'#56657a'}"/>
        <rect x="130" y="68" width="220" height="4" fill="${n?'#5a5a60':'#e3d9c3'}"/>
        ${[0,1,2,3].map(i=>`<rect x="${144+i*34}" y="84" width="22" height="32" rx="2" fill="${win(n,true)}"/>`).join('')}
        <rect x="288" y="92" width="40" height="40" fill="${n?'#1e1410':'#4a3226'}"/>
        <rect x="190" y="52" width="100" height="14" rx="2" fill="${n?'#1c1814':'#2a1e18'}"/><text x="240" y="62.5" text-anchor="middle" font-size="8" ${SVGF} fill="#f4e2a8">LIBRARY</text>
        <rect x="140" y="124" width="200" height="8" fill="${n?'#3a3c3a':'#cfc7b2'}"/>
        ${person(100,n,'#c0392b',146,.9)}${person(372,n,'#2a6fa8',146,.9)}${lamp(352,n,146)}`},
    fh_garden:{name:'Fern Hill community garden',ic:'🌻',desc:'A neighborhood garden and playfield: raised beds, a shed with a hand-painted sign, a swing set and a picnic table under an old maple',
      art:({night:n})=>`${starsSky(n)}
        <rect y="92" width="480" height="58" fill="${n?'#1a2a22':'#7fae7a'}"/>
        ${tree(36,n,30,118)}${tree(444,n,30,118)}${tree(400,n,22,118)}
        <rect x="320" y="76" width="64" height="44" fill="${wood(n)}"/><polygon points="314,78 352,56 390,78" fill="${n?'#2c3644':'#8a4f3a'}"/>
        <rect x="340" y="92" width="22" height="28" fill="${n?'#241a14':'#4a3226'}"/>
        ${[0,1,2].map(i=>`<rect x="${90+i*70}" y="110" width="56" height="22" fill="${n?'#4a3524':'#8a6a46'}"/><rect x="${94+i*70}" y="106" width="48" height="8" fill="${n?'#2a3a22':'#5a8a46'}"/>${[0,1,2,3].map(k=>`<circle cx="${102+i*70+k*12}" cy="${104-(k%2)*3}" r="4" fill="${['#e74c8c','#f2b630','#fff','#c0392b'][(i+k)%4]}"/>`).join('')}`).join('')}
        <path d="M36 70 h26 M40 70 v22 M58 70 v22" stroke="${n?'#7a6a5a':'#6a4a3a'}" stroke-width="2" fill="none"/>
        <path d="M0 140 Q200 134 480 140" stroke="${n?'#3a3c3a':'#cdc5b0'}" stroke-width="6" fill="none"/>
        ${person(250,n,'#c98a12',142,.9)}${person(280,n,'#8e44ad',142,.9)}`},
  },
  travel:{'fh_main|fh_library':6,'fh_main|fh_garden':8,'fh_library|fh_garden':5},
  neighbors:[
    {id:'fh_hazel',n:'Hazel',ic:'🥞',at:['fh_main'],d:'Runs the diner her mother opened, and remembers every regular’s order and most of their cousins’. Will tell you to sit down in a tone you do not argue with.'},
    {id:'fh_dmitri',n:'Dmitri',ic:'🌱',at:['fh_garden','fh_library'],d:'Retired mail carrier who now minds the community garden beds like a route. Gives away tomatoes with a short lecture on how to store them.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    if(loc==='fh_main'){
      const open=isOpen('fh_main');
      if(!once('diner')){const c=rp(10);a.push({ic:'🥞',l:`Breakfast-all-day at Hazel’s — ${$(c)}`,s:open?(canAfford(c)?'45 min. Energy +12, stress −6, community +1. Once a day.':'Not enough cash.'):hoursTxt('fh_main'),cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);mark('diner');pass(45);adj('energy',12);adj('stress',-6);adj('community',1);S.stats.meals++;const x=meet('fh_hazel');
          say(pick(['🥞 Hash browns crisp at the edges, eggs just right, coffee that never reaches the bottom of the cup. A man at the counter does the crossword out loud.','🥞 A short stack the size of a hubcap. The waitress calls you “hon” and you feel, briefly, adopted.'])+(x?` The owner stops by your booth: <b>Hazel</b>. ${nb('fh_hazel').d}`:' Hazel tops off your coffee without asking.'))}})}
      const t=rp(8);a.push({ic:'🧥',l:`Dig through Second Wind Thrift — ${$(t)}`,s:open?(canAfford(t)?`40 min. ${cap(calmTxt(8))}.`:'Not enough cash.'):hoursTxt('fh_main'),cat:'here',dis:!open||!canAfford(t),
        fn:()=>{spend(t);pass(40);calm(8);S.stats.walks++;say(pick(['🧥 A rack of flannel, a lamp shaped like a pineapple, a bin of mystery cables. You leave with a good wool sweater with the tags still on, and a feeling of having won.','🧥 The volunteer at the register says every item has a story and she knows maybe a third of them. You buy a mug that says WORLD’S OKAYEST GARDENER.']))}});
    }
    if(loc==='fh_library'){
      const open=isOpen('fh_library');
      a.push({ic:'📖',l:'Read in the quiet corner',s:open?`50 min. ${cap(calmTxt(12))}. Free.`:hoursTxt('fh_library'),cat:'rest',dis:!open,
        fn:()=>{pass(50);calm(12);adj('energy',3);say(pick(['📖 A big chair by the window, a stack of magazines, a radiator that hums. An hour disappears the way it used to when you were nine.','📖 Somebody is quietly knitting across from you. You read three chapters. Nobody needs anything from you.']))}});
      a.push({ic:'💻',l:'Use the public computers to catch up on paperwork',s:open?'40 min. Stress −6, energy −3. Free.':hoursTxt('fh_library'),cat:'money',dis:!open,
        fn:()=>{pass(40);adj('stress',-6);adj('energy',-3);say('💻 A librarian helps you print a form and shows you where the stapler hides. Free printing for the first ten pages. You leave with a lighter to-do list.')}});
      if(!once('storytime')){a.push({ic:'🧒',l:'Stop by the story time',s:open?'30 min. Stress −7, community +2. Once a day.':hoursTxt('fh_library'),cat:'people',dis:!open,
        fn:()=>{mark('storytime');pass(30);adj('stress',-7);adj('community',2);const x=meet('fh_dmitri');say('🧒 A librarian does all the voices, including a very convincing walrus. A toddler offers you a damp board book.'+(x?` A grandfather beside you chuckles: <b>Dmitri</b>. ${nb('fh_dmitri').d}`:''))}})}
    }
    if(loc==='fh_garden'){
      a.push({ic:'🌱',l:'Weed a bed with the garden crew',s:'60 min. Energy −8, stress −12, community +3.',cat:'people',
        fn:()=>{pass(60);adj('energy',-8);adj('stress',-12);adj('community',3);const x=meet('fh_dmitri');say('🌱 Gloves, a trowel, a bed of beans. The dirt is warm and everyone is oddly cheerful about bindweed.'+(x?` The bed’s caretaker nods at you: <b>Dmitri</b>. ${nb('fh_dmitri').d}`:' Dmitri hands you a bag of snap peas.'))}});
      if(!once('picnic')){a.push({ic:'🧺',l:'Sit under the maple and rest',s:'30 min. Energy +7, stress −8. Once a day.',cat:'rest',
        fn:()=>{mark('picnic');pass(30);adj('energy',7);adj('stress',-8);say('🧺 The picnic table has a hundred initials carved in it. Swings squeak, bees are busy, and the maple does the work of being an excellent tree.')}})}
    }
    return a;
  },
});

defEvent({id:'fernhill_reading',hook:'arrive',tile:['🏆','Summer reading prizes','good'],chance:0.4,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='fernhill'&&c.at==='fh_library'&&tod()>=600&&tod()<1020,
  run:()=>{say('🏆 The library is handing out summer reading prizes: paper medals, a coupon for a free scoop, a poster of a very tired owl.')},
  choices:()=>[
    {ic:'📚',l:'Join the reading circle',s:'25 min. Energy −3, stress −4, community +3',fn:()=>{pass(25);adj('energy',-3);adj('stress',-4);adj('community',3);say('📚 A kid proudly counts her books out loud (forty-one). You sit on the carpet with a circle of readers and trade favorites.')}},
    {ic:'🏆',l:'Cheer for the winners',s:'5 min. Stress −2, community +1',fn:()=>{pass(5);adj('stress',-2);adj('community',1);say('🏆 The librarian hands you a bookmark “for moral support.”')}},
    {ic:'🚶',l:'Keep going',s:'No time. Nothing changes',fn:()=>{say('🚶 You let the applause fade behind you.')}}],
  dflt:2});
defEvent({id:'fernhill_thrift',hook:'arrive',tile:['🎁','A thrift-shop treasure','good'],chance:0.3,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='fernhill'&&c.at==='fh_main'&&tod()>=420&&tod()<1080,
  run:()=>{say('🎁 A volunteer waves you over to the “just in” cart: a hand-knit blanket, still smelling faintly of cedar. “Free to anyone who looks like they could use a nap,” she says.')},
  choices:()=>{const g=rp(3);return[
    {ic:'😴',l:'Take the blanket and rest a while',s:'25 min. Energy +10, stress −5',fn:()=>{pass(25);adj('energy',10);adj('stress',-5);say('😴 You look like you could use a nap. You take one, on a bench, under cedar-smelling wool.')}},
    {ic:'🛍️',l:`Browse and leave a ${$(g)} donation`,s:'15 min. Community +3, stress −3',dis:!canAfford(g),fn:()=>{spend(g);pass(15);adj('community',3);adj('stress',-3);say('🛍️ The volunteers show you the best shelf and the worst lamp. The donation jar gets heavier by a little.')}},
    {ic:'🚶',l:'Pass, someone else needs it',s:'No time. Community +1',fn:()=>{adj('community',1);say('🚶 You point the blanket toward a man carrying too many bags. He takes it gratefully.')}}]},
  dflt:2});
defEvent({id:'fernhill_cleanup',hook:'arrive',tile:['🧹','Neighborhood cleanup','good'],chance:0.3,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='fernhill'&&c.at==='fh_garden'&&daytime(),
  run:()=>{say('🧹 A neighborhood cleanup crew hands out bags and gloves at the garden corner.')},
  choices:()=>[
    {ic:'🧹',l:'Work the whole shift',s:'30 min. Energy −8, stress −5, community +4',fn:()=>{setEventFlag('fh_cleanup','worked');pass(30);adj('energy',-8);adj('stress',-5);adj('community',4);say('🧹 One lost shoe and a surprising amount of bottle caps later, the corner looks great. Someone high-fives you with a trash grabber.')}},
    {ic:'🧤',l:'Bag a few and go',s:'10 min. Energy −2, stress −2, community +1',fn:()=>{setEventFlag('fh_cleanup','bit');pass(10);adj('energy',-2);adj('stress',-2);adj('community',1);say('🧤 You fill one bag, hand the gloves back and promise to bring a friend next time.')}},
    {ic:'🚶',l:'Wave and keep going',s:'No time. Nothing changes',fn:()=>{say('🚶 You wish them luck and go on your way.')}}],
  dflt:2});
defEvent({id:'fernhill_icecream',hook:'arrive',tile:['🍦','Ice-cream social','good'],chance:0.3,max:1,cond:c=>!isGrow()&&hoodOf(c.at)==='fernhill'&&c.at==='fh_garden'&&tod()>=900&&tod()<1200,
  run:()=>{say(`🍦 The block club is hosting an ice-cream social under the maple: three flavors, a mountain of sprinkles, a folding table with a hand-lettered “Donations welcome, seconds encouraged.”${eventFlag('fh_cleanup')==='worked'?' A volunteer recognizes you from the cleanup and shouts, “Cleanup crew eats first!”':''}`)},
  choices:()=>{const w=eventFlag('fh_cleanup')==='worked';return[
    {ic:'🍦',l:'Stay for seconds and talk',s:'25 min. Stress −6, community +'+(w?4:3),fn:()=>{pass(25);adj('stress',-6);adj('community',w?4:3);say('🍦 You have seconds. Then, with encouragement, thirds.')}},
    {ic:'🥄',l:'One quick scoop to go',s:'8 min. Stress −3, community +1',fn:()=>{pass(8);adj('stress',-3);adj('community',1);say('🥄 One scoop, one napkin, one thank-you.')}},
    {ic:'🚶',l:'Keep going',s:'No time. Nothing changes',fn:()=>{say('🚶 You wave at the maple and keep going.')}}]},
  dflt:2});
})();
