// ============================================================
//  TACOMPTON, Pierce County packs: the valley (county:true), two towns you can start a life in.
//  Sumner ('sumner'): the old brick Main Street and its rhubarb (it calls itself the Rhubarb Pie Capital of the World; the
//    pie shop is invented), the Sounder station (from 2000; the engine knows Sumner's train), a farm stand among the fields,
//    and Bonney Lake up on the plateau with Allan Yorke Park on Lake Tapps.
//  Orting ('orting'): the town park under Mount Rainier, Washington Avenue, the Washington Soldiers Home (1891) and the
//    Foothills Trail, with the lahar sirens (from about 2000) and the schools' walking evacuation drills as a plain
//    everyday fact of life. Prefix vly_. The county engine (72-county.js) keeps the places hidden until the county is open.
// ============================================================
(function(){
const KS='sumner',KO='orting';
const HF=()=>(S.hoodFlags=S.hoodFlags||{});
const once=k=>!!HF()[`valley_${k}_${day()}`], mark=k=>{HF()[`valley_${k}_${day()}`]=true};
const meet=id=>{if(S.met[id])return false;S.met[id]=day()+1;S.stats.neighbors=metCount();adj('community',2);return true};
const nb=id=>NEIGHBORS.find(x=>x.id===id)||{d:''};
const Y=()=>{try{return typeof yearNow==='function'?yearNow():2026}catch(e){return 2026}};   // (yearNow isn't ready while the files load)
const sounder=()=>Y()>=2000;   // Sounder trains from Tacoma to Seattle, stopping in Sumner, from 2000
const sirens=()=>Y()>=2000;    // the lahar warning sirens and the yearly walking drill
const brick=n=>n?'#40251f':'#a8553f', rhu=n=>n?'#5a2030':'#c0395a';
const fields=n=>`<rect y="110" width="480" height="40" fill="${n?'#1a2a1e':'#7aa36a'}"/>${[0,1,2,3,4].map(i=>`<path d="M0 ${116+i*7} H480" stroke="${n?'#22361f':'#6a9058'}" stroke-width="2"/>`).join('')}`;
const siren=(x,n,b=140)=>`<rect x="${x}" y="${b-70}" width="4" height="70" fill="${n?'#4a4f55':'#7a8086'}"/><rect x="${x-8}" y="${b-80}" width="20" height="12" rx="3" fill="${n?'#5a5f63':'#c9ced2'}"/>${[0,1,2].map(i=>`<rect x="${x-6+i*6}" y="${b-77}" width="3" height="6" fill="${n?'#2a2e32':'#5a6066'}"/>`).join('')}`;

defHood({
  key:KS, county:true, startable:true, rent:1.05,
  startBlurb:'Sumner, out in the valley east of Tacoma: an old brick Main Street, rhubarb pie, farms on every side and the Sounder train to Tacoma and Seattle (from 2000).',
  schools:{town:'Sumner',middle:'Sumner Middle School',high:'Sumner High School'},
  home:{desc:'Your apartment in Sumner, over a shop a block off Main Street: boxes, a bed, a fridge, and from the bathroom window, if you lean, the mountain'},
  name:'Sumner and Bonney Lake', ic:'🥧', blurb:'The farm valley east of Tacoma, where the White River meets the Puyallup: Sumner’s old brick Main Street, its rhubarb and its farm stands, and Bonney Lake up on the plateau above, with a lake beach and ball fields.',
  hub:'vly_station', ride:{via:'bus',mins:50,fare:2,drive:30},
  places:{
    vly_station:{name:'Sumner Station',ic:'🚉',desc:'',
      art:({night:n})=>`${starsSky(n)}${rainier(n,360,.6,100)}${fields(n)}
        <rect x="60" y="78" width="190" height="40" fill="${n?'#3a3e46':'#e8e2d4'}"/><polygon points="50,80 155,62 260,80" fill="${n?'#2a3040':'#2a6fa8'}"/>
        ${[0,1,2,3].map(i=>`<rect x="${76+i*44}" y="88" width="22" height="16" fill="${win(n)}"/>`).join('')}
        <rect x="0" y="122" width="480" height="8" fill="${HC.street(n)}"/><path d="M0 126 H480" stroke="${n?'#5a5f63':'#9a9ea2'}" stroke-width="1.2"/>
        ${sounder()?`<g><rect x="270" y="94" width="190" height="28" rx="4" fill="${n?'#c9ced2':'#f4f5f2'}"/><rect x="270" y="112" width="190" height="4" fill="#2f6b9a"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${280+i*22}" y="99" width="14" height="10" fill="${n?'#f2d58a':'#5d7f93'}"/>`).join('')}<rect x="276" y="86" width="178" height="8" rx="3" fill="${n?'#b9bfc3':'#e3e6e8'}"/></g>`:`<rect x="300" y="100" width="120" height="22" rx="4" fill="${n?'#c9ced2':'#f4f5f2'}"/><rect x="300" y="112" width="120" height="4" fill="#2a6fa8"/>${[0,1,2,3].map(i=>`<rect x="${308+i*26}" y="103" width="16" height="8" fill="${n?'#f2d58a':'#5d7f93'}"/>`).join('')}`}
        ${person(120,n,'#c0392b',122,.85)}${person(200,n,'#2a6fa8',122,.85)}${lamp(30,n,122)}`},
    vly_sumner:{name:'Downtown Sumner, Main Street',ic:'🥧',desc:'A few blocks of old brick storefronts with antique shops, flower baskets on the lampposts and the Rhubarb Pie Co. (invented), where the rhubarb comes from farms just outside town. The valley shipped rhubarb all over the country for decades',
      hours:d=>d%7===6?[600,1020]:[480,1080],
      art:({night:n})=>`${starsSky(n)}${tree(24,n,16,140)}${tree(458,n,16,140)}
        ${[['ANTIQUES','#2f6b4a',44,n?'#32343d':'#c9a77a'],['RHUBARB PIE CO.','#c0395a',166,brick(n)],['HARDWARE','#2a6fa8',300,n?'#2e3a36':'#d9c9a0']].map(([t,c,x,w],i)=>`
          <rect x="${x}" y="${i===1?44:58}" width="126" height="${i===1?96:82}" fill="${w}"/><rect x="${x-3}" y="${i===1?40:54}" width="132" height="6" fill="${n?'#2a1e1a':'#6a3f2e'}"/>
          <rect x="${x+8}" y="${i===1?50:64}" width="110" height="12" rx="2" fill="#2a1e18"/><text x="${x+63}" y="${i===1?59.5:73.5}" text-anchor="middle" font-size="7.5" ${SVGF} fill="#f4e2a8">${t}</text>
          <path d="M${x} ${i===1?70:84} h126 l-6 12 h-114 z" fill="${c}"/><rect x="${x+10}" y="${i===1?94:104}" width="50" height="30" fill="${win(n)}"/><rect x="${x+76}" y="${i===1?94:104}" width="36" height="${i===1?46:36}" fill="${n?'#241a14':'#4a3226'}"/>
          ${i===1?`<circle cx="${x+24}" cy="114" r="7" fill="${n?'#7a5a3a':'#e8b878'}"/><circle cx="${x+44}" cy="114" r="7" fill="${n?'#7a5a3a':'#e8b878'}"/><path d="M${x+18} 112 h12 M${x+38} 112 h12" stroke="${rhu(n)}" stroke-width="2"/>`:''}`).join('')}
        ${[34,150,290,430].map(x=>`<rect x="${x}" y="110" width="2" height="36" fill="${n?'#4a4f55':'#3c4248'}"/><circle cx="${x+1}" cy="108" r="7" fill="${n?'#3a2a3a':'#e74c8c'}" opacity=".9"/>`).join('')}
        ${person(140,n,'#2a6fa8',146,.95)}${person(280,n,'#8e44ad',146,.95)}<rect y="146" width="480" height="4" fill="${HC.walk(n)}"/>`},
    vly_farm:{name:'Valley farm stand',ic:'🌾',desc:'A wooden farm stand on a family farm (invented) in the fields between Sumner and the river: rhubarb in spring, then berries, sweet corn and pumpkins, with a field of daffodils behind it in April. The valley grew rhubarb and daffodil bulbs for the whole country for decades',
      hours:d=>{const m=dateOf(d).m;return m>=4&&m<=10?[540,1080]:null},
      art:({night:n})=>`${starsSky(n)}${rainier(n,330,.8,100)}${fields(n)}
        ${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<circle cx="${20+i*14}" cy="${118+(i%3)*4}" r="2.5" fill="${n?'#6a6a30':'#f2d02a'}"/>`).join('')}
        <rect x="250" y="96" width="120" height="40" fill="${n?'#3a2a22':'#b98b62'}"/><polygon points="242,98 310,76 378,98" fill="${n?'#2a1e1a':'#7a3a2a'}"/>
        <rect x="262" y="104" width="96" height="10" rx="2" fill="#2a1e18"/><text x="310" y="111.5" text-anchor="middle" font-size="6.5" ${SVGF} fill="#f4e2a8">FARM STAND</text>
        ${[0,1,2,3].map(i=>`<rect x="${262+i*24}" y="120" width="20" height="12" fill="${n?'#3a2a2a':['#c0395a','#e8b878','#2f8f6a','#c98a12'][i]}"/>`).join('')}
        <rect x="400" y="84" width="40" height="52" fill="${n?'#3a1e1a':'#a8403a'}"/><polygon points="394,86 420,66 446,86" fill="${n?'#2a1a18':'#6a2a24'}"/>
        ${person(230,n,'#2f6b4a',140,.9)}`},
    vly_bonney:{name:'Allan Yorke Park, Bonney Lake',ic:'🏖️',desc:'Bonney Lake’s big park on the shore of Lake Tapps, up on the plateau above the valley: a swimming beach, a dock, ball fields and a long line of cars with boat trailers on a sunny Saturday',
      art:({night:n})=>`${starsSky(n)}${rainier(n,330,.75,96)}<rect y="96" width="480" height="38" fill="${HC.bay(n)}"/><path d="M40 108 q22 -4 44 0 M200 118 q22 -4 44 0 M360 110 q22 -4 44 0" stroke="${HC.bay2(n)}" stroke-width="2" fill="none" opacity=".7"/>
        ${[20,60,420,460].map((x,i)=>`<path d="M${x} 100 l12 -30 l12 30 z" fill="${HC.leaf(n)}"/>`).join('')}
        <rect y="130" width="480" height="20" fill="${n?'#5a5040':'#e3d3a8'}"/><rect x="300" y="118" width="120" height="5" fill="${n?'#3a2a22':'#b98b62'}"/>${[310,350,390].map(x=>`<rect x="${x}" y="120" width="3" height="12" fill="${n?'#3a2a22':'#b98b62'}"/>`).join('')}
        ${[0,1,2].map(i=>`<rect x="${90+i*40}" y="122" width="28" height="10" rx="2" fill="${['#c0392b','#2a6fa8','#f2b630'][i]}" opacity="${n?.4:.95}"/>`).join('')}
        ${person(200,n,'#c0392b',146,.9)}${person(222,n,'#2f8f6a',146,.8)}${lamp(260,n,146)}`},
  },
  travel:{'vly_station|vly_sumner':5,'vly_station|vly_farm':10,'vly_station|vly_bonney':18,'vly_sumner|vly_farm':8,'vly_sumner|vly_bonney':16,'vly_farm|vly_bonney':18},
  neighbors:[
    {id:'vly_ruth',n:'Ruth',ic:'🥧',at:['vly_sumner'],d:'Bakes at the Rhubarb Pie Co. from four in the morning and grew up on a rhubarb farm by the river. Will tell you, unprompted, that a real rhubarb pie has no strawberries in it, and then sell you a strawberry-rhubarb anyway.'},
    {id:'vly_marco',n:'Marco',ic:'🏖️',at:['vly_bonney','vly_station'],d:'Commutes from Bonney Lake to a warehouse in Sumner and coaches Little League at Allan Yorke Park on Saturdays. Has opinions about the traffic on the hill up to the plateau, and shares them.'},
    {id:'vly_lupe',n:'Lupe',ic:'🌾',at:['vly_farm'],d:'Runs the farm stand for her family and has worked these fields since she was tall enough to carry a flat of berries. Weighs your rhubarb by eye and is never more than a few ounces off.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi,mo=dateOf(d).m;
    if(loc==='vly_station'){
      a.push({ic:'🪑',l:sounder()?'Wait on the platform and watch the trains':'Sit by the tracks and watch the freight go by',s:`20 min. ${cap(calmTxt(4))}.`,cat:'rest',fn:()=>{pass(20);calm(4);say(sounder()?pick(['🪑 A Sounder train sighs into the station, double-decker cars full of people with laptops, and slides off toward Seattle. A freight train follows, a mile of boxcars headed for the port.','🪑 Commuters with coffee, a mom with a stroller, and the mountain hanging over the parking garage like it was painted there.']):'🪑 A freight train a mile long rumbles through, boxcars and grain cars, the crossing bells clanging. A boy on a bike counts them out loud and loses track at ninety.')}});
    }
    if(loc==='vly_sumner'){
      const open=isOpen('vly_sumner'),p=rp(6);
      if(!once('pie'))a.push({ic:'🥧',l:`A slice of rhubarb pie and coffee — ${$(p)}`,s:open?(canAfford(p)?'30 min. Energy +8, stress −7. Once a day.':'Not enough cash.'):hoursTxt('vly_sumner'),cat:'food',dis:!open||!canAfford(p),
        fn:()=>{spend(p);mark('pie');pass(30);adj('energy',8);adj('stress',-7);const x=meet('vly_ruth');say(pick(['🥧 Tart, sweet, pink at the edges, with a crust that shatters. You understand the town a little better now.','🥧 A warm slice with a scoop of vanilla melting into the lattice. The table next to you is three generations of one family, all eating the same pie in silence. High praise.'])+(x?` The baker comes out wiping her hands: <b>Ruth</b>. ${nb('vly_ruth').d}`:''))}});
      const w=rp(18);a.push({ic:'🥧',l:`Take a whole pie home — ${$(w)}`,s:open?(canAfford(w)?'10 min. 2 meals for the fridge, stress −4.':'Not enough cash.'):hoursTxt('vly_sumner'),cat:'food',dis:!open||!canAfford(w),fn:()=>{spend(w);pass(10);S.food+=2;adj('stress',-4);say('🥧 A whole rhubarb pie in a white box tied with string. It rides home on your lap like a baby.')}});
      a.push({ic:'🏺',l:'Poke around the antique shops',s:`45 min. ${cap(calmTxt(7))}.`,cat:'here',dis:!open,fn:()=>{pass(45);calm(7);say(pick(['🏺 Old rhubarb crate labels from the valley farms, a box of Daffodil Parade buttons going back fifty years, and a cast-iron pan you almost buy.','🏺 A whole room of old tools, a whole room of dolls, and a shop dog asleep in a 1950s armchair with a SOLD tag on it.']))}});
    }
    if(loc==='vly_farm'){
      const open=isOpen('vly_farm'),c=rp(8),mo2=dateOf(d).m;
      a.push({ic:'🧺',l:`Fill a bag at the farm stand — ${$(c)}`,s:open?(canAfford(c)?`15 min. 2 meals for the fridge, stress −3.`:'Not enough cash.'):'The farm stand is open April to October, about 9 AM to 6 PM.',cat:'food',dis:!open||!canAfford(c),
        fn:()=>{spend(c);pass(15);S.food+=2;adj('stress',-3);const x=meet('vly_lupe');say((mo2<=5?'🧺 Red stalks of rhubarb as long as your arm, a bunch of asparagus and a jar of jam.':mo2<=7?'🧺 A flat of strawberries still warm from the sun, and a pint of raspberries you eat half of in the car.':mo2<=8?'🧺 Six ears of sweet corn, a bag of green beans and a tomato that tastes like August.':'🧺 Apples, a squash and a pumpkin the kids at the next table are very jealous of.')+(x?` The woman at the scale rounds down: <b>Lupe</b>. ${nb('vly_lupe').d}`:''))}});
      if(mo2===4)a.push({ic:'🌼',l:'Walk the edge of the daffodil field',s:`20 min. ${cap(calmTxt(8))}.`,cat:'rest',fn:()=>{pass(20);calm(8);say('🌼 A whole field gone yellow, rows and rows of daffodils nodding in the wind, the mountain behind them. This is where the parade floats come from.')}});
    }
    if(loc==='vly_bonney'){
      const swim=mo>=6&&mo<=8&&at(660,1140);
      if(!once('swim'))a.push({ic:'🏊',l:'Swim at the lake beach',s:swim?'45 min. Free. Energy −6, stress −14. Once a day.':'The swimming beach is for summer afternoons.',cat:'rest',dis:!swim,
        fn:()=>{mark('swim');pass(45);adj('energy',-6);adj('stress',-14);say(pick(['🏊 Cold for one second, then perfect. You float on your back out past the rope line and look straight up at the mountain. Not a bad ceiling.','🏊 Kids cannonball off the dock, a lifeguard blows a whistle, and somebody’s grandpa does a dignified breaststroke all the way to the buoy and back.']))}});
      a.push({ic:'⚾',l:'Watch a ball game at the fields',s:`40 min. ${cap(calmTxt(6))}, community +1.`,cat:'people',dis:!(mo>=4&&mo<=8&&(day()%7>=5||at(1020,1230))),fn:()=>{pass(40);calm(6);adj('community',1);const x=meet('vly_marco');say('⚾ Nine-year-olds in matching shirts, a coach who claps for every swing, and a dad running the scoreboard by hand.'+(x?` The coach comes over to the fence at the end of the inning: <b>Marco</b>. ${nb('vly_marco').d}`:''))}});
    }
    return a;
  },
});
defHood({
  key:KO, county:true, startable:true, rent:1.0,
  startBlurb:'Orting, a small town in the Puyallup River valley with Mount Rainier right at the end of every street. The lahar sirens and the school walking drills are part of ordinary life here.',
  schools:{town:'Orting',middle:'Orting Middle School',high:'Orting High School'},
  home:{desc:'Your apartment in Orting, in a little building off Washington Avenue: boxes, a bed, a fridge, and a window full of Mount Rainier'},
  name:'Orting', ic:'🏔️', blurb:'A small town in the valley where the Carbon River meets the Puyallup, with Mount Rainier closer than anywhere else you could live: a town park and a gazebo, a main street, the old Soldiers Home and a flat trail between the farms. The sirens on the poles are for lahars, and everyone knows the walking route uphill.',
  hub:'vly_orting', ride:{via:'bus',mins:60,fare:2,drive:40},
  places:{
    vly_orting:{name:'Orting town park',ic:'🏔️',desc:'',
      art:({night:n})=>`${starsSky(n)}${rainier(n,260,1.2,104)}${fields(n)}
        <rect y="120" width="480" height="30" fill="${n?'#1a2a22':'#6f9a74'}"/>${tree(40,n,20,134)}${tree(100,n,16,134)}${tree(420,n,22,134)}
        <rect x="190" y="104" width="70" height="28" fill="${n?'#3a3e46':'#f1ede2'}"/><polygon points="184,106 225,90 266,106" fill="${n?'#2a2224':'#8a3a30'}"/><rect x="216" y="114" width="16" height="18" fill="${n?'#1e1410':'#4a3226'}"/>
        ${sirens()?siren(320,n,136):''}<path d="M0 142 Q200 132 480 142" stroke="${n?'#3a3c3a':'#cdc5b0'}" stroke-width="6" fill="none"/>
        ${person(150,n,'#c98a12',146,.9)}${person(370,n,'#2a6fa8',146,.9)}${lamp(290,n,146)}`},
    vly_trail:{name:'Foothills Trail, Orting',ic:'🚲',desc:'A paved trail on an old railroad grade, running flat and straight along the Carbon and Puyallup rivers with cows, barns and the mountain filling the end of every view. Bikes, strollers, horses and a lot of waving',
      art:({night:n})=>`${starsSky(n)}${rainier(n,300,1.05,100)}${fields(n)}
        <path d="M120 150 L230 104 H250 L360 150 Z" fill="${n?'#2a2e32':'#5a5f63'}"/><path d="M240 106 V150" stroke="#e8d27a" stroke-width="1.5" stroke-dasharray="6 6" opacity="${n?.3:.7}"/>
        <rect x="30" y="100" width="56" height="30" fill="${n?'#3a1e1a':'#a8403a'}"/><polygon points="24,102 58,82 92,102" fill="${n?'#2a1a18':'#6a2a24'}"/><rect x="50" y="112" width="16" height="18" fill="${n?'#1e1410':'#4a2a1e'}"/>
        ${[400,430].map(x=>`<ellipse cx="${x}" cy="128" rx="11" ry="6" fill="${n?'#3a3a3a':'#f4f0e6'}"/><circle cx="${x+10}" cy="124" r="4" fill="${n?'#3a3a3a':'#2a2a2a'}"/>`).join('')}
        ${person(250,n,'#2f6b4a',140,.8)}${person(280,n,'#c0392b',146,.9)}`},
    vly_soldiers:{name:'Washington Soldiers Home',ic:'🎖️',desc:'The state’s home for veterans at the edge of Orting, opened in 1891 for Civil War veterans: old buildings and lawns, a small cemetery with rows of white stones, and a flagpole the whole town can see',
      art:({night:n})=>`${starsSky(n)}${rainier(n,360,.9,100)}<rect y="112" width="480" height="38" fill="${n?'#1a2a22':'#6f9a74'}"/>
        <rect x="70" y="70" width="200" height="52" fill="${n?'#3a3e46':'#f1ede2'}"/><polygon points="62,72 170,46 278,72" fill="${n?'#2a2e36':'#5a4a40'}"/>
        ${[0,1,2,3,4,5].map(i=>`<rect x="${84+i*30}" y="80" width="14" height="14" fill="${win(n,i%2===0)}"/><rect x="${84+i*30}" y="100" width="14" height="14" fill="${win(n,i%3!==1)}"/>`).join('')}
        ${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${300+(i%4)*20}" y="${124+Math.floor(i/4)*10}" width="6" height="8" rx="3" fill="${n?'#5a5a60':'#f4f4f0'}"/>`).join('')}
        <rect x="290" y="60" width="2" height="62" fill="${n?'#777':'#cfd5d8'}"/><rect x="292" y="60" width="24" height="14" fill="${n?'#5a3030':'#b8302a'}"/><rect x="292" y="60" width="10" height="7" fill="${n?'#2a2f4a':'#2a3f8a'}"/>
        ${tree(30,n,18,130)}${tree(440,n,20,130)}${person(200,n,'#2a6fa8',146,.9)}`},
    vly_oave:{name:'Washington Avenue, Orting',ic:'🥐',desc:'Orting’s little main street: a bakery (invented) that sells out of cinnamon rolls by ten, a hardware store, a pizza place and the bus shelter, with the mountain at the end of the street',
      hours:d=>[360,1200],
      art:({night:n})=>`${starsSky(n)}${rainier(n,240,1.3,100)}
        ${[['BAKERY','#c98a12',30],['HARDWARE','#2a6fa8',180],['PIZZA','#c0392b',330]].map(([t,c,x])=>`<rect x="${x}" y="72" width="120" height="68" fill="${n?'#33343c':'#d9c9a7'}"/><rect x="${x+8}" y="78" width="104" height="11" rx="2" fill="#2a1e18"/><text x="${x+60}" y="86.5" text-anchor="middle" font-size="7.5" ${SVGF} fill="#f4e2a8">${t}</text><path d="M${x} 92 h120 l-5 10 h-110 z" fill="${c}"/><rect x="${x+10}" y="106" width="46" height="26" fill="${win(n)}"/><rect x="${x+76}" y="106" width="30" height="34" fill="${n?'#241a14':'#4a3226'}"/>`).join('')}
        ${person(165,n,'#8e44ad',146,.9)}${person(310,n,'#2f6b4a',146,.9)}${lamp(160,n,146)}<rect y="146" width="480" height="4" fill="${HC.walk(n)}"/>`},
  },
  travel:{'vly_orting|vly_oave':3,'vly_orting|vly_trail':4,'vly_orting|vly_soldiers':8,'vly_oave|vly_trail':5,'vly_oave|vly_soldiers':8,'vly_trail|vly_soldiers':10},
  neighbors:[
    {id:'vly_dee',n:'Dee',ic:'🚌',at:['vly_orting','vly_trail'],d:'Drives a school bus in Orting and walks the lahar drill route with the kids every year, at the back of the line, carrying the first-aid bag. Talks about the mountain the way you’d talk about a big dog you love and keep an eye on.'},
    {id:'vly_walt',n:'Walt',ic:'🎖️',at:['vly_soldiers','vly_oave'],d:'A Vietnam veteran who lives at the Soldiers Home and walks to the bakery every morning at seven, rain or shine, in a jacket covered with pins. He has a story for each pin and tells them in no particular order.'},
  ],
  actions:(loc,d,m)=>{const a=[],at=(lo,hi)=>m>=lo&&m<hi,mo=dateOf(d).m;
    if(loc==='vly_orting'){
      a.push({ic:'🏔️',l:'Sit in the park and look at the mountain',s:`30 min. ${cap(calmTxt(9))}.`,cat:'rest',fn:()=>{pass(30);calm(9);say(pick(['🏔️ From Orting the mountain is not a postcard on the horizon. It is right there at the end of the street, enormous, so close you can see the glaciers’ blue cracks.','🏔️ A soldier’s widow from the old state Soldiers Home on the hill feeds the ducks. Kids ride bikes in circles around the gazebo. The mountain looks down on all of it.']))}});
      if(sirens())a.push({ic:'📣',l:'Read the evacuation signs',s:`15 min. ${cap(calmTxt(2))}, community +1.`,cat:'here',fn:()=>{pass(15);calm(2);adj('community',1);const x=Math.random()<.5&&meet('vly_dee');
        say('📣 Blue signs with a running figure point uphill: the walking route out of the valley. A mudflow from the mountain, a lahar, could reach town in under an hour, and the sirens on the poles would give the warning. Here it is just a fact, like the weather: everybody knows the route, the schools practice it every year, and life goes on.'+(x?` A woman in a bus driver’s jacket stops to tell you which way she walks the kids: <b>Dee</b>. ${nb('vly_dee').d}`:''))}});
      else a.push({ic:'📜',l:'Read the marker about the old mudflow',s:`15 min. ${cap(calmTxt(2))}.`,cat:'here',fn:()=>{pass(15);calm(2);say('📜 The town stands on the deposits of the Electron mudflow, which came down from the mountain about 500 years ago. The county is talking about warning sirens. For now, people just know.')}});
    }
    if(loc==='vly_trail'){
      const b=rp(15);a.push({ic:'🚲',l:`Rent a bike and ride the trail — ${$(b)}`,s:at(540,1140)?(canAfford(b)?'1 hour 30 min. Energy −10, stress −14.':'Not enough cash.'):'The rental shop is open about 9 AM to 7 PM.',cat:'rest',dis:!at(540,1140)||!canAfford(b),
        fn:()=>{spend(b);pass(90);adj('energy',-10);adj('stress',-14);S.stats.walks++;say(pick(['🚲 Flat, straight and fast, the river beside you and the mountain dead ahead. You pass cows, a horse that turns its head, and a farm stand with an honor box.','🚲 Out to the next town and back with the wind behind you one way. Your legs are jelly and your head is empty in the best way.']))}});
      a.push({ic:'🚶',l:'Walk a stretch of the trail',s:`45 min. ${cap(calmTxt(8))}.`,cat:'rest',fn:()=>{pass(45);calm(8);S.stats.walks++;const x=Math.random()<.3&&meet('vly_dee');say('🚶 The old railroad grade runs dead straight between fields. Everyone you pass says hello, every single person.'+(x?` One of them is walking the route on purpose, timing it: <b>Dee</b>. ${nb('vly_dee').d}`:''))}});
    }
    if(loc==='vly_oave'){
      const open=isOpen('vly_oave'),c=rp(5);
      if(!once('roll'))a.push({ic:'🥐',l:`A cinnamon roll and coffee at the bakery — ${$(c)}`,s:open&&m<600?(canAfford(c)?'25 min. Energy +8, stress −5. Once a day.':'Not enough cash.'):'The cinnamon rolls sell out by about 10 AM.',cat:'food',dis:!open||m>=600||!canAfford(c),
        fn:()=>{spend(c);mark('roll');pass(25);adj('energy',8);adj('stress',-5);const x=meet('vly_walt');say('🥐 A roll the size of a softball, frosting running down the sides. The table by the window is all old men in ball caps, solving the town’s problems one coffee at a time.'+(x?` One of them makes room for you: <b>Walt</b>. ${nb('vly_walt').d}`:''))}});
      a.push({ic:'🚶',l:'Walk Washington Avenue to the end',s:`20 min. ${cap(calmTxt(5))}, community +1.`,cat:'here',fn:()=>{pass(20);calm(5);adj('community',1);say(pick(['🚶 Every block, the mountain gets bigger at the end of the street. A man watering the planters says hi. So does the woman at the hardware store, through the window.','🚶 The pizza place has a sign: OPEN UNTIL THE DOUGH RUNS OUT. A kid on a bike yells your name, then realizes you are not who he thought, and yells sorry.']))}});
    }
    if(loc==='vly_soldiers'){
      a.push({ic:'🎖️',l:'Walk the grounds and the little cemetery',s:`30 min. ${cap(calmTxt(7))}, community +1.`,cat:'here',fn:()=>{pass(30);calm(7);adj('community',1);const x=Math.random()<.4&&meet('vly_walt');say('🎖️ Rows of white stones with names and wars on them, the oldest from the Civil War. Somebody has left a small flag at one and a pinwheel at another. The mountain watches over the whole quiet place.'+(x?` A man in a jacket full of pins is visiting a friend: <b>Walt</b>. ${nb('vly_walt').d}`:''))}});
      if(!once('visit'))a.push({ic:'🤝',l:'Spend an hour visiting with the residents',s:'1 hour. Stress −8, community +3. Once a day.',cat:'people',fn:()=>{mark('visit');pass(60);adj('stress',-8);adj('community',3);say(pick(['🤝 Cribbage in the day room with a Navy man who cheats and admits it, and a retired nurse who doesn’t and still wins.','🤝 You help push a wheelchair out to the porch so its owner can see the mountain. “Best seat in Orting,” he says, and it is.']))}});
    }
    return a;
  },
});
// descriptions that change with the year (defHood copies the places, so they are set here)
Object.defineProperty(L.vly_station,'desc',{configurable:true,enumerable:true,get(){return sounder()
  ?'Sumner’s train station by the old downtown, with a parking garage and a platform where the Sounder commuter trains stop on the way between Tacoma and Seattle'
  :'The railroad tracks by the old downtown, where freight trains rumble through and the bus from Tacoma stops on the corner. No passenger trains, for now'},set(v){}});
Object.defineProperty(L.vly_station,'name',{configurable:true,enumerable:true,get(){return sounder()?'Sumner Station':'The tracks and the bus stop, Sumner'},set(v){}});
Object.defineProperty(L.vly_orting,'desc',{configurable:true,enumerable:true,get(){return sirens()
  ?'A small town square with a gazebo, a war memorial and big old trees, and above it all Mount Rainier, closer than anywhere else you can live. A siren on a pole by the park is part of the warning system for lahars, the mudflows the mountain can send down the valley'
  :'A small town square with a gazebo, a war memorial and big old trees, and above it all Mount Rainier, closer than anywhere else you can live'},set(v){}});

// until the county engine (72-county.js) is in the build, the places stay hidden (it adds its own countyOn() gate on top)
for(const K of [KS,KO])for(const k of Object.keys(HOODS[K].places)){const p=L[k],d0=Object.getOwnPropertyDescriptor(p,'hidden');if(d0&&d0.get)continue;let h=!!(d0&&d0.value);
  Object.defineProperty(p,'hidden',{configurable:true,enumerable:true,get(){return h||typeof countyOn!=='function'},set(v){h=v}})}

// ---- the guide: the Pierce County chapter's sections (72-county.js) ----
if(typeof countyGuideAreas==='function'){const g=countyGuideAreas;countyGuideAreas=function(){return g()+`<h3>🥧 Sumner and Bonney Lake</h3>
  <p>The valley east of Tacoma: Sumner’s Main Street (rhubarb pie, antiques), a farm stand from April to October, and Bonney Lake’s Allan Yorke Park with a summer swimming beach. The bus goes out here, and from 2000 the Sounder train stops in Sumner at rush hour. Watch for the Daffodil Parade in April and, in later years, Rhubarb Days in July. You can start a life in Sumner.</p>
  <h3>🏔️ Orting</h3>
  <p>A small town with Mount Rainier at the end of every street: the town park, Washington Avenue’s bakery, the Washington Soldiers Home (1891) and the flat Foothills Trail. ${Y()>=2000?'The sirens on the poles warn of lahars, the mudflows the mountain can send down the valley: they are tested at noon once a month, and the schools walk the evacuation route uphill every year.':'The town stands on an old mudflow from the mountain, and everyone knows it.'} It is a plain fact of life here, not a worry you carry around. You can start a life in Orting.</p>`}}


// ---- events ----
const here=(c,k)=>!isGrow()&&c&&c.at===k;
defEvent({id:'vly_siren_test',hook:'arrive',tile:['📣','The siren test','info'],chance:0.7,max:3,cooldown:25,cond:c=>(here(c,'vly_orting')||here(c,'vly_trail'))&&sirens()&&dateOf(day()).d<=7&&day()%7===0&&tod()>=690&&tod()<780,
  run:()=>{say('📣 At noon the siren on the pole by the park starts up: a few notes of chimes, then a calm recorded voice saying this is only a test of the lahar warning system. Nobody in the park even looks up. A kid on the swings sings along with the chimes.')},
  choices:()=>[
    {ic:'🗺️',l:'Ask someone what you would do for real',s:'15 min. Stress −2, community +2.',fn:()=>{pass(15);adj('stress',-2);adj('community',2);const x=meet('vly_dee');say('🗺️ “Walk uphill, don’t drive, don’t wait to see it,” she says, and points the route out. “The kids could do it in their sleep. That’s the idea.”'+(x?` <b>Dee</b>. ${nb('vly_dee').d}`:''))}},
    {ic:'👍',l:'Carry on like everybody else',s:'Nothing changes.',fn:()=>{say('📣 The chimes end. The swings creak. A normal Monday in Orting.')}}],dflt:1});
defEvent({id:'vly_drill',hook:'arrive',tile:['🎒','The walking drill','info'],chance:0.6,max:1,cooldown:200,cond:c=>{const o=dateOf(day());return here(c,'vly_orting')&&sirens()&&Y()>=2001&&(o.m===10||o.m===5)&&day()%7<5&&tod()>=540&&tod()<720},
  run:()=>{say('🎒 Hundreds of schoolkids are walking out of town in long, orderly lines, teachers in orange vests at the corners, heading uphill on the evacuation route. It is the yearly lahar drill. A fourth grader tells you, very seriously, that they have to beat the clock.')},
  choices:()=>[
    {ic:'👏',l:'Cheer them along from the corner',s:'20 min. Stress −4, community +2.',fn:()=>{pass(20);adj('stress',-4);adj('community',2);say('🎒 You clap for every class that goes by. The fourth graders bow. A teacher mouths “thank you.”')}},
    {ic:'🚶',l:'Walk part of the route with the stragglers',s:'40 min. Energy −6, stress −2, community +3.',fn:()=>{pass(40);adj('energy',-6);adj('stress',-2);adj('community',3);const x=meet('vly_dee');say('🚶 You walk at the back with a bus driver and the first-aid bag, up the hill to where the ground rises out of the valley, and back down with the whole parade.'+(x?` <b>Dee</b>. ${nb('vly_dee').d}`:''))}},
    {ic:'🛑',l:'Stay out of the way',s:'Nothing changes.',fn:()=>{say('🎒 You wait on the sidewalk while the lines go by.')}}],dflt:2});
defEvent({id:'vly_daffodil',hook:'arrive',tile:['🌼','The Daffodil Parade','good'],chance:0.8,max:1,cooldown:300,cond:c=>{const o=dateOf(day());return (here(c,'vly_sumner')||here(c,'vly_orting'))&&o.m===4&&o.d<=21&&day()%7===5&&tod()>=600&&tod()<1080},
  run:()=>{say('🌼 The Daffodil Parade is coming through town: floats covered in thousands of yellow daffodils from the valley fields, marching bands, the Daffodil princesses waving from convertibles. It started in Tacoma this morning and rolls through Puyallup, Sumner and Orting, all in one day.')},
  choices:()=>{const c=rp(4);return [
    {ic:'🌼',l:`Find a curb and stay for the whole thing, with kettle corn — ${$(c)}`,s:'1 hour 15 min. Stress −14, community +3.',dis:!canAfford(c),fn:()=>{spend(c);pass(75);adj('stress',-14);adj('community',3);say('🌼 A float shaped like a steam train, all daffodils, a high school band in rain ponchos, a tractor with a dog driving, more or less. You wave at everyone. Everyone waves back.')}},
    {ic:'👀',l:'Watch a few floats',s:'20 min. Stress −5.',fn:()=>{pass(20);adj('stress',-5);say('🌼 A wall of yellow rolls by, and the whole street smells like spring.')}},
    {ic:'🚶',l:'Go around the crowd',s:'Nothing changes.',fn:()=>{say('🌼 You hear the bands two blocks away.')}}]},dflt:1});
defEvent({id:'vly_rhubarb_days',hook:'arrive',tile:['🥧','Rhubarb Days','good'],chance:0.7,max:1,cooldown:300,cond:c=>{const o=dateOf(day());return here(c,'vly_sumner')&&Y()>=2012&&o.m===7&&o.d>=10&&o.d<=24&&day()%7===5&&tod()>=600&&tod()<1020},
  run:()=>{say('🥧 Main Street is closed to cars for Rhubarb Days: booths, a band, a pie-eating contest with a waiting list, and a table selling rhubarb everything: pie, jam, lemonade, salsa, even rhubarb ice cream.')},
  choices:()=>{const c=rp(6);return [
    {ic:'🍨',l:`Try the rhubarb ice cream and wander — ${$(c)}`,s:'1 hour. Stress −10, community +2.',dis:!canAfford(c),fn:()=>{spend(c);pass(60);adj('stress',-10);adj('community',2);say('🍨 Pink, tart, cold, and somehow exactly right. You watch the pie-eating contest. The winner is a quiet grandmother who never once looks up.')}},
    {ic:'👀',l:'Walk one block of it',s:'15 min. Stress −4.',fn:()=>{pass(15);adj('stress',-4);say('🥧 Music, a crowd, a lot of pink. A good town having a good day.')}}]},dflt:1});

window.VALLEY_KEYS=[KS,KO];
})();
