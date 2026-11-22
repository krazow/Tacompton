// ============================================================
//  TACOMPTON neighborhood pack: Eastside & the Port.
//  Portland Avenue's family homes and a community hall (invented), the Port of Tacoma tideflats with the big cranes and the
//  mouth of the Puyallup River (Puyallup homeland), and a taco truck lot (invented). Bus from Hilltop, 22 minutes.
// ============================================================

// a container ship at the wharf: hull, stacked containers, a bridge tower at the stern (right)
const eaShip=(x,n,b=112,s=1)=>{
  const cols=['#2a6fa8','#b8402a','#2f8f6a','#c98a12','#5d6a75','#8e44ad'];
  const stack=(cx,rows,seed)=>Array.from({length:rows},(_,r)=>`<rect x="${cx}" y="${-12-r*7}" width="13" height="6.5" fill="${n?'#2c3138':cols[(seed+r*2)%cols.length]}"/>`).join('');
  return `<g transform="translate(${x},${b}) scale(${s})"><path d="M0 -10 H150 l-8 12 H10 z" fill="${n?'#2a1f22':'#2e3a46'}"/><rect x="0" y="-12" width="150" height="3" fill="${n?'#4a2a26':'#b8402a'}"/>
  ${[0,1,2,3,4,5,6,7].map(i=>stack(6+i*14,i%3===1?4:3,i)).join('')}
  <rect x="124" y="-36" width="20" height="26" fill="${n?'#4a4f55':'#efe8da'}"/><rect x="127" y="-33" width="14" height="4" fill="${win(n)}"/><rect x="120" y="-42" width="28" height="6" fill="${n?'#3a3f45':'#d5ccb8'}"/><rect x="132" y="-52" width="3" height="10" fill="${n?'#555':'#666'}"/>${n?'<circle cx="146" cy="-39" r="1.6" fill="#f7d77a"/><circle cx="12" cy="-14" r="1.4" fill="#f7d77a"/>':''}</g>`};

// a community-garden bed with tomato stakes, standing on b
const eaBed=(x,n,b=140,w=44)=>`<rect x="${x}" y="${b-8}" width="${w}" height="8" fill="${n?'#2a1f18':'#6b4a32'}"/>${[0,1,2,3].map(i=>`<path d="M${x+6+i*(w-12)/3} ${b-8} v-16" stroke="${n?'#4a4030':'#a08a5a'}" stroke-width="1.5"/><circle cx="${x+6+i*(w-12)/3}" cy="${b-14}" r="5" fill="${n?'#13261d':'#3d7a4e'}"/><circle cx="${x+8+i*(w-12)/3}" cy="${b-12}" r="2" fill="${n?'#6a2a22':'#d0452e'}"/>`).join('')}`;

defHood({
  key:'eastside', name:'Eastside & the Port', ic:'🏗️',
  blurb:'Portland Avenue’s porches, a taco truck with a line, and below it all the tideflats: the giant cranes, the container stacks and the Puyallup River meeting the bay. This is Puyallup homeland, and the work down there has been moving the world’s things for a very long time.',
  hub:'ea_portland', ride:{via:'🚌 Bus',mins:22,fare:2},
  places:{
    ea_portland:{name:'Portland Avenue & the Family Hall',ic:'🏡',
      desc:'The Eastside’s main drag: family homes with chain-link and rose bushes, and the Portland Avenue Family Hall, a made-up community center with a gym, a kitchen and a garden out front',
      hours:()=>[480,1260],
      art:({night:n})=>`${starsSky(n)}${rainier(n,400,.62,100)}
        ${craftsman(20,n,n?'#34303a':'#c9a97a',140,[1,0,1])}
        <rect x="132" y="62" width="190" height="78" fill="${n?'#3a3f46':'#d9d0bd'}"/><rect x="128" y="56" width="198" height="8" fill="${n?'#2a2f36':'#2f6b4a'}"/>
        <rect x="150" y="30" width="154" height="22" rx="4" fill="${n?'#1f2a26':'#2f6b4a'}"/><text x="227" y="45" text-anchor="middle" font-size="9" ${SVGF} fill="${n?'#b9c9b9':'#f4ead0'}">PORTLAND AVE FAMILY HALL</text>
        ${[0,1,2,3].map(i=>`<rect x="${142+i*44}" y="80" width="26" height="22" fill="${win(n,i!==1)}"/>`).join('')}<rect x="214" y="106" width="26" height="34" fill="${n?'#1e1a16':'#5a3a26'}"/>
        <path d="M138 70 h8 M310 70 h8" stroke="#f2b630" stroke-width="3"/>${[0,1,2,3,4].map(i=>`<circle cx="${150+i*30}" cy="70" r="2.4" fill="${['#f2b630','#e3642e','#2a6fa8','#2f8f6a','#c0392b'][i]}"/>`).join('')}
        ${eaBed(336,n,144,40)}${tree(402,n,15,142)}${craftsman(388,n,n?'#2e3a40':'#9ec0a6',142,[0,1,1])}
        ${person(120,n,'#c0392b',146,.95)}${person(330,n,'#e3642e',146,.9)}${lamp(104,n)}
        <rect x="0" y="146" width="480" height="4" fill="${HC.walk(n)}"/>`},
    ea_port:{name:'Tideflats viewpoint',ic:'🚢',
      desc:'A gravel pullout above the Port of Tacoma, where the container ships tie up under the giant cranes and the Puyallup River slides into the bay. Puyallup land, and a working one',
      art:({night:n,dusk})=>`${starsSky(n)}
        <rect y="70" width="480" height="70" fill="${HC.bay(n)}"/>${dusk&&!n?'<rect y="70" width="480" height="8" fill="#f4b183" opacity=".35"/>':''}
        <path d="M0 70 Q60 62 120 68 T240 66 V72 H0 Z" fill="${HC.mtn(n)}" opacity=".7"/>
        <path d="M30 96 q24 -4 48 0 M190 90 q24 -4 48 0 M140 112 q24 -4 48 0 M70 124 q24 -4 48 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
        <path d="M0 100 Q40 96 70 106 T120 130 L96 140 H0 Z" fill="${n?'#2a3a2a':'#7d8a5a'}" opacity=".9"/><path d="M20 140 Q60 112 110 112 T150 98" stroke="${n?'#3a4a52':'#8a7a5a'}" stroke-width="6" fill="none" opacity=".55"/>
        <rect x="230" y="100" width="250" height="8" fill="${n?'#2a2e33':'#8a8d86'}"/>${eaShip(262,n,100,1.05)}
        ${crane(300,n,100,.9)}${crane(362,n,100,.9)}${crane(424,n,100,.9)}${crane(470,n,100,.9)}
        ${[0,1,2].map(i=>boxesOnDock(236+i*80,n,112)).join('')}
        ${n?[200,250,300,350,400,450].map((x,i)=>`<circle cx="${x}" cy="${74+i%3*3}" r="1.3" fill="#f7d77a"/>`).join('')+[262,322,382,442].map(x=>`<circle cx="${x-60}" cy="60" r="1.4" fill="#e74c3c"/>`).join(''):bird(180,34)+bird(210,26)}
        <rect x="0" y="134" width="480" height="16" fill="${n?'#232a26':'#7a7f6c'}"/><rect x="40" y="124" width="150" height="3" fill="${n?'#4a4f55':'#5a6066'}"/>${[50,100,150,184].map(x=>`<rect x="${x}" y="124" width="3" height="12" fill="${n?'#4a4f55':'#5a6066'}"/>`).join('')}
        <rect x="244" y="120" width="76" height="18" rx="2" fill="${n?'#1f2a26':'#2f6b4a'}"/><text x="282" y="132" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#b9c9b9':'#f4ead0'}">TIDEFLATS VIEW</text>
        <rect x="256" y="138" width="3" height="10" fill="#555"/><rect x="304" y="138" width="3" height="10" fill="#555"/>
        ${person(120,n,'#24507a',134,.9)}${lamp(386,n,148)}`},
    ea_taco:{name:'The taco truck lot',ic:'🌮',
      desc:'A gravel lot off Portland Avenue with a red-and-white taco truck, string lights, three picnic tables and a line that starts before the window opens',
      hours:()=>[660,1260],
      art:({night:n})=>`${starsSky(n)}${crane(80,n,118,.8)}${crane(420,n,118,.8)}
        <rect x="0" y="118" width="480" height="32" fill="${n?'#25272a':'#8a877c'}"/>
        <rect x="130" y="70" width="200" height="60" rx="6" fill="${n?'#4a2a26':'#c0392b'}"/><rect x="130" y="108" width="200" height="22" fill="${n?'#d0ccc0':'#f4f0e6'}"/>
        <rect x="160" y="82" width="110" height="26" fill="${n?'#f7d77a':'#2a1a14'}"/><rect x="156" y="78" width="118" height="5" fill="${n?'#7a2a22':'#f4f0e6'}"/>
        ${[0,1,2,3,4,5].map(i=>`<rect x="${156+i*20}" y="73" width="10" height="5" fill="${n?'#3a2a26':'#c0392b'}"/>`).join('')}
        <rect x="288" y="82" width="32" height="26" fill="${win(n)}"/><circle cx="160" cy="132" r="11" fill="#222"/><circle cx="160" cy="132" r="4" fill="#999"/><circle cx="296" cy="132" r="11" fill="#222"/><circle cx="296" cy="132" r="4" fill="#999"/>
        <rect x="168" y="42" width="124" height="22" rx="4" fill="${n?'#2a1a14':'#2a1a14'}"/><text x="230" y="57" text-anchor="middle" font-size="10" ${SVGF} fill="#f2b630">LA GRÚA ROJA · TACOS</text>
        <path d="M30 56 Q130 74 230 62 T440 56" stroke="${n?'#555':'#444'}" stroke-width="1" fill="none"/>${[50,100,150,200,260,310,360,410].map((x,i)=>`<circle cx="${x}" cy="${60+Math.sin(i)*4+ (i>1&&i<6?6:0)}" r="3" fill="${n?['#f7d77a','#ff9a6a','#8fd6ff','#f7d77a'][i%4]:'#e8e2d0'}"/>`).join('')}
        <rect x="350" y="112" width="60" height="5" fill="${n?'#4a3e34':'#8a6b48'}"/><rect x="356" y="117" width="3" height="16" fill="#555"/><rect x="402" y="117" width="3" height="16" fill="#555"/>
        <rect x="52" y="116" width="52" height="5" fill="${n?'#4a3e34':'#8a6b48'}"/><rect x="58" y="121" width="3" height="14" fill="#555"/><rect x="95" y="121" width="3" height="14" fill="#555"/>
        ${person(120,n,'#2f8f6a',140,.95)}${person(134,n,'#f2b630',140,.85)}${person(380,n,'#8e44ad',116,.8)}${person(430,n,'#2a6fa8',140)}${lamp(444,n,148)}`},
  },
  travel:{'ea_portland|ea_port':12,'ea_portland|ea_taco':6,'ea_port|ea_taco':9},
  neighbors:[
    {id:'ea_roz',n:'Roz Tafoya',ic:'⚓',at:['ea_port','ea_taco'],d:'Longshore worker for nineteen years, third generation on the docks. She can tell you the weight of a container by how the crane leans, and she brings her own hot sauce to the taco truck because “everyone’s is a little off.”'},
    {id:'ea_reyes',n:'The Reyes family',ic:'🎂',at:['ea_portland','ea_taco'],d:'Four generations in one blue house on Portland Avenue: Abuela Lupe, Mr. and Mrs. Reyes, three kids and Camila, who turns fifteen this month. Somebody is always cooking, and the invitations go out on a hand-painted card.'},
  ],
  actions:(loc,d,m)=>{
    const a=[],at=(lo,hi)=>m>=lo&&m<hi;
    S.hoodFlags=S.hoodFlags||{};
    const F=k=>`eastside_${k}_${d}`;
    if(loc==='ea_portland'){
      const open=isOpen('ea_portland');
      if(!S.hoodFlags[F('garden')]) a.push({ic:'🍅',l:'Harvest in the Family Hall garden',s:open&&at(480,1140)?'1 hour. Energy −6, stress −10, community +2, food +1. Once a day.':'The garden crew works 8 AM to 7 PM.',cat:'people',dis:!open||!at(480,1140)||S.energy<10,
        fn:()=>{S.hoodFlags[F('garden')]=true;pass(60);adj('energy',-6);adj('stress',-10);adj('community',2);S.food++;say(pick(['🍅 You fill a bucket with tomatoes, one with squash, and a paper bag with more cilantro than anyone could use. A kid tells you which bed is “the fancy one.” You are allowed a bag to take home. Food +1.','🍅 Rows of beans, a fence of sunflowers and a sign that says “Take what you need, weed what you can.” You weed what you can. Food +1.','🍅 An auntie in a sun hat teaches you to pick a tomato by the sound it makes coming off the vine. You do not hear it. She is kind about it. Food +1.']))}});
      if(!S.hoodFlags[F('chat')]) a.push({ic:'👋',l:'Visit with the neighbors on the porches',s:'30 min. You might meet someone (community +2), or catch up with someone you know (+1). Once a day.',cat:'people',
        fn:()=>{S.hoodFlags[F('chat')]=true;pass(30);let x=null;if(!S.met.ea_reyes){S.met.ea_reyes=d+1;S.stats.neighbors=metCount();adj('community',2);x=stNb('ea_reyes')}
          if(x) say(`👋 A woman on a porch swing waves you up the steps and a kid hands you a glass of agua fresca without being asked: <b>${x.n}</b>. ${x.d}`);else{adj('community',1);say(pick(['👋 Abuela Lupe tells you about the Eastside in the ’60s: who ran the grocery, which corner had the best dances. Camila corrects the dates. They both laugh.','👋 Porch, lemonade, a dog named Bruno who leans against your shin like it is his job. You stay longer than you meant to.']))}}});
      a.push({ic:'🌹',l:'Walk Portland Avenue',s:`30 min. ${cap(calmTxt(7))}.`,cat:'here',fn:()=>{pass(30);S.stats.walks++;calm(7);say(pick(['🌹 Rose bushes behind chain-link, a man hosing down his driveway, a toddler in rain boots in August. The bus sighs by. Nobody is in a hurry.','🌹 A mural of the avenue’s old storefronts, a church with a hand-painted sign, a barbershop with the radio out the door. You get waved at four times.','🌹 Every third house has a shrine to the Seahawks, the Virgin Mary or a very large tomato plant. Sometimes all three.']))}});
      a.push({ic:'🎲',l:'Play dominoes in the Family Hall',s:open&&at(540,1230)?'45 min. Energy −2, stress −9, community +2. Open to everyone.':'The hall is open 8 AM to 9 PM.',cat:'here',dis:!open||!at(540,1230),
        fn:()=>{pass(45);adj('energy',-2);adj('stress',-9);adj('community',2);say(pick(['🎲 The tables by the kitchen are loud and serious. You lose to a man in a Mariners cap who calls every tile out loud before he plays it. He apologizes, then wins again.','🎲 Abuela Lupe pairs you with her grandson. You are carried. You will not be told this, but you were.']))}});
    }
    if(loc==='ea_port'){
      if(!S.hoodFlags[F('ship')]) a.push({ic:'🚢',l:'Watch a ship come in',s:'40 min. '+cap(calmTxt(12))+'. Once a day. Two tugs, one very big ship, no hurry.',cat:'rest',cls:'',
        fn:()=>{S.hoodFlags[F('ship')]=true;pass(40);calm(12);say(pick(['🚢 A container ship the length of three football fields slides in from Commencement Bay, two tugs nudging it like sheepdogs. The cranes lower their booms as if bowing. It takes forty minutes and not one person looks at a phone.','🚢 The ship is stacked taller than the building it’s passing, in red, blue and rust. A horn rolls across the water and hits your chest. Behind it, the river mouth goes silver in the light.','🚢 A ship from somewhere far arrives like it’s the most normal thing in the world. It is, here, and it still gets you.']))}});
      a.push({ic:'🌿',l:'Walk the river mouth trail',s:`45 min. ${cap(calmTxt(9))}, energy −4.`,cat:'here',fn:()=>{pass(45);S.stats.walks++;calm(9);adj('energy',-4);say(pick(['🌿 Where the Puyallup River meets the bay the water goes from brown to green in a line you can see. Herons stand in the shallows like they’re waiting for a bus. This is the homeland of the Puyallup people, and the river carries their name.','🌿 A gravel path, a sign about the river’s history, the cranes huge on one side and cattails on the other. Both are doing their jobs.']))}});
      a.push({ic:'⚓',l:'Talk with a longshore worker on break',s:at(870,1050)||at(1110,1200)?'30 min. Community +2. Shift change brings the crowd.':'30 min. Community +1. Quieter between shifts.',cat:'people',
        fn:()=>{pass(30);let x=null;if(!S.met.ea_roz){S.met.ea_roz=d+1;S.stats.neighbors=metCount();adj('community',2);x=stNb('ea_roz')}
          if(x) say(`⚓ A woman in a hard hat and high-vis vest nods at the bench next to you and unscrews a thermos: <b>${x.n}</b>. ${x.d}`);else{adj('community',at(870,1050)||at(1110,1200)?2:1);say(pick(['⚓ Roz explains lashing, twist-locks and why the 4 AM ship is always the hard one. “Everything in your apartment came through somewhere like this,” she says. You look at your couch differently.','⚓ A crew changes shift: hard hats, thermoses, quiet nods. Roz introduces you to two of them as “the new one.” You are the new one.']))}}});
    }
    if(loc==='ea_taco'){
      const open=isOpen('ea_taco'),p=rp(9);
      if(!S.hoodFlags[F('tacos')]) a.push({ic:'🌮',l:`A plate of tacos al pastor — ${$(p)}`,s:open?'25 min. Energy +16, stress −6. Once a day. Pineapple, onion, fresh tortillas.':'The truck is open 11 AM to 9 PM.',cat:'food',cls:S.food<=1&&open?'primary':'',dis:!open||!canAfford(p),
        fn:()=>{spend(p);S.hoodFlags[F('tacos')]=true;S.stats.meals++;pass(25);adj('energy',16);adj('stress',-6);say(pick(['🌮 Three tacos, shaved off the spit, a sliver of pineapple on top, a lime wedge and a cup of the red salsa that makes your ears sweat. You eat on the hood of a stranger’s truck, with permission.','🌮 The line is twelve people long and moves like clockwork. A longshoreman in front of you orders for his whole crew by memory. Worth every minute.','🌮 Corn tortillas pressed by hand, a spoon of onion and cilantro, a squeeze of lime. Whatever you were worried about shrinks a little.']))}});
      const b=rp(4);
      a.push({ic:'🥤',l:`An agua fresca — ${$(b)}`,s:open?'10 min. Energy +6, stress −2.':'The truck is closed.',cat:'food',dis:!open||!canAfford(b),fn:()=>{spend(b);pass(10);adj('energy',6);adj('stress',-2);say('🥤 Jamaica, cold, in a plastic cup that sweats through its napkin. Sweet and tart, like August.')}});
      if(!S.hoodFlags[F('table')]) a.push({ic:'🪑',l:'Share a picnic table',s:'30 min. You might meet someone (community +2), or catch up (+1). Once a day.',cat:'people',
        fn:()=>{S.hoodFlags[F('table')]=true;pass(30);const left=['ea_roz','ea_reyes'].filter(id=>!S.met[id]);let x=null;if(left.length){const id=pick(left);S.met[id]=d+1;S.stats.neighbors=metCount();adj('community',2);x=stNb(id)}
          if(x) say(`🪑 The only seat left is across from <b>${x.n}</b>, who slides the napkins over without a word. ${x.d}`);else{adj('community',1);say(pick(['🪑 A table of six makes room, passes the salsa and tells you which tacos to get next time. There is a next time.','🪑 Kids race along the gravel, somebody’s radio plays cumbia, the cranes stand over it all in the dusk like tall quiet uncles.']))}}});
    }
    return a;
  },
});

// ---- events (Eastside only) ----
const eaAt=(c,...k)=>!isGrow()&&hoodOf(c.at)==='eastside'&&(!k.length||k.includes(c.at));
defEvent({id:'ea_ship_arrives',hook:'arrive',tile:['🚢','A giant ship comes in','good'],chance:0.4,max:2,cooldown:2,cond:c=>eaAt(c,'ea_port'),
  run:()=>{pass(15);adj('stress',-7);say('🚢 You pull in just as a container ship the size of a city block rounds the point. The cranes stop. The tugs whistle. A crane operator forty feet up the leg waves at nobody in particular, and you wave back at him anyway.')}});
defEvent({id:'ea_shift_change',hook:'arrive',tile:['⚓','Shift change at the port','good'],chance:0.45,max:1,cond:c=>eaAt(c,'ea_port')&&((tod()>=870&&tod()<960)||(tod()>=1110&&tod()<1200)),
  run:()=>{const x=stMet('ea_roz');adj('stress',-3);adj('community',1);say(`⚓ Trucks and hard hats pour out of the gate while a fresh crew walks in, high-fives all the way down the line. ${x?'A woman at the viewpoint fence points out which crane is hers: <b>Roz</b>. ':'Roz waves from the gate. '}“Four hours on, you won’t sit down. Eight hours later you won’t want to.” She grins. “I love it.”`)}});
defEvent({id:'ea_quince',hook:'arrive',tile:['🎂','A quinceañera invitation','good'],chance:0.4,max:1,cond:c=>eaAt(c,'ea_portland','ea_taco')&&day()>=2,
  run:()=>{const x=stMet('ea_reyes');adj('community',4);adj('stress',-5);S.food++;say(`🎂 ${x?'A girl in a paint-splattered T-shirt stops you on the sidewalk: <b>Camila Reyes</b>, who turns fifteen next weekend. ':'Camila Reyes stops you on the sidewalk. '}She hands you a hand-painted invitation to her quinceañera at the Family Hall. “Come. Eat. You do not have to dance. Abuela Lupe will make you anyway.” Her mother presses a foil-wrapped tamal into your hand for the road. Food +1.`)}});
defEvent({id:'ea_garden_harvest',hook:'arrive',tile:['🍅','The garden is coming in','good'],chance:0.4,max:1,cond:c=>eaAt(c,'ea_portland')&&daytime(),
  run:()=>{S.food+=2;adj('community',3);adj('stress',-4);say('🍅 The Family Hall garden is exploding: tomatoes, tomatillos, squash, a row of chiles in every color. A crew of kids and aunties is filling boxes for the whole avenue. Somebody puts one in your arms. Food +2.')}});
defEvent({id:'ea_river_heron',hook:'arrive',tile:['🪶','A heron at the river mouth','good'],chance:0.25,max:1,cond:c=>eaAt(c,'ea_port')&&daytime(),
  run:()=>{adj('stress',-5);say('🪶 A great blue heron lands on a piling right in front of a hundred-ton crane, folds itself up like an umbrella and looks at you with total disapproval. The Puyallup River slides by below, the way it has since long before any of this was built.')}});
