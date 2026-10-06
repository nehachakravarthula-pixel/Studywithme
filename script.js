const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const app=$("#app"), screens=$$(".screen"), starCount=$("#starCount");
const locations={
 bedroom:["BEDROOM","Warm & familiar."],treehouse:["TREEHOUSE","Quiet and leafy."],library:["LIBRARY","Pages & peace."],
 garden:["COMMUNITY GARDEN","Flowers & sunshine."],cafe:["COZY CAFÉ","Warm little tables."],porch:["FRONT PORCH","Watch the world."],
 park:["PARK BENCH","Breeze & birds."],lake:["LAKESIDE DOCK","Very quiet."]
};
let state=JSON.parse(localStorage.getItem("cozyTigerStudy")||'{"stars":0,"location":"bedroom"}');
let timerId=null, remaining=1500, paused=false, sound=false;

function save(){localStorage.setItem("cozyTigerStudy",JSON.stringify(state)); starCount.textContent=state.stars}
function show(id){screens.forEach(s=>s.classList.toggle("active",s.id===id))}
function dayNight(){
 const h=new Date().getHours(), night=h>=17||h<6;
 app.classList.toggle("night",night);
}
function sceneDecor(name){
 const scene=$("#studyScene"), env=$(".environment");
 scene.dataset.location=name;
 const bg={
 bedroom:["#f0b77e","#b57a58"],treehouse:["#79a66d","#8a6249"],library:["#a87355","#6e4e3e"],garden:["#8db56a","#7d9d58"],
 cafe:["#d99a69","#855a42"],porch:["#e3a071","#7a5642"],park:["#6fa16a","#6c9158"],lake:["#76b8c3","#9b7b56"]
 }[name]||["#f0b77e","#b57a58"];
 scene.style.setProperty("--scene-accent",bg[0]); env.style.background=bg[0];
 $("#locationName").textContent=locations[name][0]; $("#locationTag").textContent=locations[name][1];
}
function resetTimer(min=25){clearInterval(timerId); remaining=min*60; paused=false; $("#pauseBtn").textContent="PAUSE"; paintTimer()}
function paintTimer(){const m=String(Math.floor(remaining/60)).padStart(2,"0"),s=String(remaining%60).padStart(2,"0");$("#timer").textContent=`${m}:${s}`}
function startTimer(){clearInterval(timerId);timerId=setInterval(()=>{if(paused)return;remaining--;paintTimer();if(remaining<=0){clearInterval(timerId);complete()}},1000)}
function complete(){
 state.stars++; save(); $("#completeModal").classList.add("show"); burstStars(); 
}
function burstStars(){
 const modal=$("#completeModal"); modal.querySelector(".celebrate-tiger").animate([{transform:"translateY(12px) rotate(-3deg)"},{transform:"translateY(-8px) rotate(3deg)"},{transform:"translateY(0)"}],{duration:900,easing:"ease-out"});
}
function enterStudy(name){state.location=name;save();sceneDecor(name);show("study");resetTimer(25);startTimer();mapWalk(name)}
function mapWalk(name){
 const el=$("#mapTiger"), loc=document.querySelector(`.location[data-location="${name}"]`);
 if(loc){el.style.left=loc.style.getPropertyValue("--x");el.style.top=loc.style.getPropertyValue("--y")}
}
function updateNeighborhood(){
 // Progress decorations appear as tiny garden lights on the map.
 const board=$(".map-board"); board.querySelectorAll(".earned-deco").forEach(x=>x.remove());
 const count=state.stars, items=[
  [1,"✿",15,43],[3,"❀",78,37],[5,"⌂",86,66],[10,"🌳",31,25],[15,"🪑",52,72],[20,"✦",60,27],[30,"🏡",42,87]
 ];
 items.filter(x=>count>=x[0]).forEach(([n,ch,x,y])=>{const d=document.createElement("div");d.className="earned-deco";d.textContent=ch;d.style=`position:absolute;left:${x}%;top:${y}%;z-index:2;font-size:25px;filter:drop-shadow(0 2px 2px #6b4b33);`;board.appendChild(d)})
}
function audioTick(){
 if(!sound)return;
 try{const C=window.AudioContext||window.webkitAudioContext; if(!C)return; const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=523.25;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.035,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.35);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.4)}catch(e){}
}
$("#enterBtn").onclick=()=>{show("map");updateNeighborhood();mapWalk(state.location)};
$("#homeBtn").onclick=()=>{clearInterval(timerId);$("#completeModal").classList.remove("show");show("map");updateNeighborhood();mapWalk(state.location)};
$("#soundBtn").onclick=()=>{sound=!sound;$("#soundBtn").textContent=sound?"🔊":"♫";audioTick()};
$$(".location").forEach(loc=>loc.addEventListener("click",()=>enterStudy(loc.dataset.location)));
$("#pauseBtn").onclick=()=>{paused=!paused;$("#pauseBtn").textContent=paused?"RESUME":"PAUSE";audioTick()};
$("#endBtn").onclick=()=>{clearInterval(timerId);show("map");updateNeighborhood();mapWalk(state.location)};
$$(".presets button").forEach(b=>b.onclick=()=>{$$(".presets button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");resetTimer(+b.dataset.min);startTimer()});
$("#breakBtn").onclick=()=>{$("#completeModal").classList.remove("show");$("#breakStars").textContent="★".repeat(Math.min(state.stars,10));show("break");};
$("#backToMap").onclick=()=>{show("map");updateNeighborhood();mapWalk(state.location)};
dayNight();setInterval(dayNight,60000);save();updateNeighborhood();
