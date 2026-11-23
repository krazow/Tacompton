// ============================================================
//  TACOMPTON · PIERCE COUNTY ENGINE: travel across the county, starting somewhere other than Hilltop, and county jobs.
//  County areas are packs like Tacoma's neighborhoods (src/js/23-county-<key>.js, defHood with county:true). This file owns
//  the travel rules, the Go somewhere and phone grouping ("Tacoma" / "Pierce County"), the "Where you start" row of the New
//  game sheet, the county job listings and the guide's Pierce County chapter.
//
//  ---- CONTRACT (stable API; pack files: guard every call with typeof, and call these at run time, not at load) ----
//    countyOn()          → true when the county is open: the longer games (not Quick play), as an adult, or 16+ in Growing Up
//                          (a Youth ORCA card or the family car once you have a license). Your own home town is always open.
//    COUNTY_KEYS         → the keys of every pack with county:true (a live list, read it when you need it)
//    countyIs(key)       → true for a county pack's key
//    countyRide(key)     → {mins, fare, via:'bus'|'express'|'sounder'|'drive', label, drive} from Hilltop right now: the
//                          Pierce Transit bus by default, an express bus or the Sounder train at weekday rush hour where the
//                          pack has one (in their real years), the car when you're driving
//    START_PLACES        → [{key:'hilltop', name, ic, d}, …every pack with county:true and startable:true]
//    lifeStartPlace()    → the key of the place this life started ('hilltop' unless you picked a county town)
//    countyGuideAreas()  → the html of the Pierce County chapter's area sections (packs wrap it to add their own section:
//                          {const g=countyGuideAreas;countyGuideAreas=function(){return g()+`<h3>…</h3>…`}})
//  ---- what a pack can set (all optional except ride) ----
//    ride:{via:'bus', mins, fare, drive}   mins/fare: the bus from Hilltop (or miles: the engine works the bus time out);
//                          drive: minutes by car. express:{mins, fare, from} / sounder:{mins, fare, from} on the ride for an
//                          express bus or a Sounder station (from = first year). The engine fills these in for the towns it
//                          knows (Sounder at Puyallup and Sumner from 2000, Lakewood and South Tacoma from 2012).
//    narrows:true          across the Narrows Bridge (the Peninsula): a toll on the way back into Tacoma from 2007
//    startable:true, rent:1.1, schools:{middle,high}, home:{desc}, startBlurb   a town you can start in
//    growActions(loc,d,m)  Growing Up actions for the pack's places (otherwise a simple look around)
//  State: S.startPlace (the town you started in; missing = Hilltop), S.county (made on first use: Good To Go pass, tolls).
// ============================================================

// ---- the contract (function declarations and window getters, so they exist before this file's code runs) ----
function countyIs(k){return !!k&&typeof HOODS!=='undefined'&&!!HOODS[k]&&!!HOODS[k].county}
function countyKeys(){return typeof HOODS==='undefined'?[]:Object.keys(HOODS).filter(countyIs)}
Object.defineProperty(window,'COUNTY_KEYS',{configurable:true,get:countyKeys});
function countyOn(){
  if(typeof S==='undefined'||!S||typeof lifeLong!=='function'||!lifeLong())return false;
  if(typeof isGrow==='function'&&isGrow()){const a=S.age||12;return a>=16}   // a Youth ORCA card (14+) or the family car; the county opens at 16
  return true;
}
function lifeStartPlace(){const k=typeof S!=='undefined'&&S&&S.startPlace;return k&&countyIs(k)?k:'hilltop'}
function countyStartPlaces(){
  const out=[{key:'hilltop',name:'Hilltop',ic:'🏘️',d:'The old neighborhood on the hill in Tacoma: the game as it has always been.'}];
  for(const k of countyKeys()){const H=HOODS[k];if(H.startable)out.push({key:k,name:H.name,ic:H.ic,d:H.startBlurb||H.blurb})}
  return out;
}
Object.defineProperty(window,'START_PLACES',{configurable:true,get:countyStartPlaces});
function countyRide(k){return typeof COUNTY!=='undefined'&&COUNTY.ride?COUNTY.ride(k):null}
function countyGuideAreas(){return ''}
window.countyOn=countyOn;window.countyIs=countyIs;window.countyRide=countyRide;window.lifeStartPlace=lifeStartPlace;
