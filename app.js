
const $ = id => document.getElementById(id);
const DAYS=[["mon","Lunes"],["tue","Martes"],["wed","Miércoles"],["thu","Jueves"],["fri","Viernes"],["sat","Sábado"],["sun","Domingo"]];
const MUSCLES=[["full","Cuerpo completo"],["upper","Parte superior"],["lower","Parte inferior"],["back","Espalda"],["chest","Pecho"],["shoulders","Hombros"],["arms","Brazos"],["legs","Piernas"],["glutes","Glúteos"],["core","Core"]];
const GOAL_TEXT={
hypertrophy:"Desarrollar músculo: más tensión, volumen suficiente, descansos medios y progresión de banda o repeticiones.",
fitness:"Ponerse en forma: equilibrio entre fuerza, control y descansos moderados.",
conditioning:"Cardio con bandas: trabajo por tiempo, transiciones rápidas y descansos cortos.",
strength:"Fuerza: bandas exigentes, menos repeticiones, técnica estricta y descansos largos.",
endurance:"Resistencia muscular: más repeticiones o tiempo bajo tensión con descansos cortos."
};
const TARGET_MAP={full:["back","chest","shoulders","arms","legs","glutes","core"],upper:["back","chest","shoulders","arms","core"],lower:["legs","glutes","core"],back:["back","arms","core"],chest:["chest","shoulders","arms"],shoulders:["shoulders","arms","back"],arms:["arms","shoulders","back"],legs:["legs","glutes","core"],glutes:["glutes","legs","core"],core:["core","back","glutes"]};
const POSITION_LABELS={"De pie":"De pie","De pie en zancada":"De pie · zancada","Sentado":"Sentado","Sentado en suelo":"Sentado en suelo","Tumbado boca arriba":"Tumbado boca arriba","Tumbado boca abajo":"Tumbado boca abajo","Tumbado de lado":"Tumbado de lado","Tumbado / plancha":"Plancha / tumbado","Arrodillado":"Arrodillado","Medio arrodillado":"Medio arrodillado","Cuadrupedia":"Cuadrupedia"};
const ANCHOR_LABELS={"ninguno":"Sin anclaje","pies":"Banda bajo/alrededor de pies","alto":"Anclaje alto","medio-alto":"Anclaje medio-alto","cara":"Anclaje a la altura de la cara","medio":"Anclaje medio","bajo":"Anclaje bajo"};
const defaultState={
 profile:{age:"",weight:"",height:"",experience:"intermediate",goal:"hypertrophy",intensity:"moderate"},
 bands:[],
 equipment:{anchor:false,chair:true,mat:true},
 schedule:{mon:{on:true,minutes:30,focus:"auto"},tue:{on:false,minutes:30,focus:"auto"},wed:{on:true,minutes:30,focus:"auto"},thu:{on:false,minutes:30,focus:"auto"},fri:{on:true,minutes:30,focus:"auto"},sat:{on:false,minutes:30,focus:"auto"},sun:{on:false,minutes:30,focus:"auto"}},
 priorities:["full"],
 programConfig:{weeks:8,progressionSpeed:"normal",deloadEvery:4},
 program:[], currentWeek:1, history:[], exerciseLearning:{}, muscleVolume:{}, loadBias:0
};
let saved=JSON.parse(localStorage.getItem("bandcoach_v4")||"null")||JSON.parse(localStorage.getItem("bandcoach_v3")||"null");
if(!saved){
 const old=JSON.parse(localStorage.getItem("bandcoach_v2")||"null");
 saved=old?{...defaultState,...old,programConfig:defaultState.programConfig,program:[],currentWeek:1,exerciseLearning:{},muscleVolume:{}}:defaultState;
}
let state={...defaultState,...saved,profile:{...defaultState.profile,...(saved.profile||{})},schedule:{...defaultState.schedule,...(saved.schedule||{})},programConfig:{...defaultState.programConfig,...(saved.programConfig||{})},equipment:{...defaultState.equipment,...(saved.equipment||{})}};
if((state.program||[]).some(w=>(w.sessions||[]).some(sess=>(sess.exercises||[]).some(ex=>!ex.feetStart)))){state.program=[];state.currentWeek=1;localStorage.setItem("bandcoach_v4",JSON.stringify(state));}
let viewWeek=state.currentWeek||1,activeSession=null,stepIndex=0,remaining=0,initialSeconds=0,timerHandle=null,running=false,pendingFeedbackExercise=null;

function save(){localStorage.setItem("bandcoach_v4",JSON.stringify(state))}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function bandTypeLabel(t){return {long:"Banda larga",tube:"Tubo con asas",mini:"Minibanda",any:"Universal"}[t]||t}
function focusLabel(v){return Object.fromEntries(MUSCLES)[v]||v}
function goalLabel(v){return {hypertrophy:"Músculo",fitness:"Forma general",conditioning:"Cardio",strength:"Fuerza",endurance:"Resistencia muscular"}[v]||v}
function ratingLabel(v){return v==="easy"?"fácil":v==="hard"?"dura":"bien ajustada"}
function hash(s){return [...s].reduce((a,c)=>((a<<5)-a)+c.charCodeAt(0),0)}

document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
 document.querySelectorAll(".tabpane").forEach(p=>p.classList.toggle("active",p.id===b.dataset.tab));
}));

function loadProfile(){
 ["age","weight","height","experience","goal","intensity"].forEach(k=>$(k).value=state.profile[k]??"");
 $("goalExplanation").textContent=GOAL_TEXT[state.profile.goal];
}
$("goal").addEventListener("change",()=>$("goalExplanation").textContent=GOAL_TEXT[$("goal").value]);
$("saveProfile").addEventListener("click",()=>{
 state.profile={age:$("age").value,weight:$("weight").value,height:$("height").value,experience:$("experience").value,goal:$("goal").value,intensity:$("intensity").value};
 save();$("profileSaved").textContent="Guardado";setTimeout(()=>$("profileSaved").textContent="",1300);renderAll();
});

function renderBands(){
 if(!state.bands.length){$("bandList").innerHTML='<p class="muted">Aún no has añadido ninguna banda.</p>';return}
 $("bandList").innerHTML=[...state.bands].sort((a,b)=>(a.kg??999)-(b.kg??999)).map(b=>`<div class="item"><div class="itemHead"><div><strong>${esc(b.name)}</strong> · ${bandTypeLabel(b.type)} ${b.kg?`· ${b.kg} kg aprox.`:""}<br><span class="muted">${esc(b.notes||"")}</span></div><button class="danger" onclick="removeBand('${b.id}')">Eliminar</button></div></div>`).join("");
}
$("addBand").addEventListener("click",()=>{
 const name=$("bandName").value.trim();if(!name){alert("Pon un nombre o color a la banda.");return}
 state.bands.push({id:"b"+Date.now(),name,type:$("bandType").value,kg:Number($("bandKg").value)||null,notes:$("bandNotes").value.trim()});
 ["bandName","bandKg","bandNotes"].forEach(id=>$(id).value="");save();renderAll();
});
window.removeBand=id=>{state.bands=state.bands.filter(b=>b.id!==id);save();renderAll()};

function loadEquipment(){
 $("hasAnchor").checked=!!state.equipment.anchor;
 $("hasChair").checked=!!state.equipment.chair;
 $("hasMat").checked=!!state.equipment.mat;
}
$("saveEquipment").addEventListener("click",()=>{
 state.equipment={anchor:$("hasAnchor").checked,chair:$("hasChair").checked,mat:$("hasMat").checked};
 save(); $("equipmentSaved").textContent="Guardado"; setTimeout(()=>$("equipmentSaved").textContent="",1300); renderLibraryStats();
});

function renderSchedule(){
 $("scheduleGrid").innerHTML=DAYS.map(([id,label])=>{
  const s=state.schedule[id],opts=[["auto","Automático"],...MUSCLES].map(([v,l])=>`<option value="${v}" ${s.focus===v?"selected":""}>${l}</option>`).join("");
  return `<div class="scheduleRow"><label class="daycheck"><input type="checkbox" data-dayon="${id}" ${s.on?"checked":""}>${label}</label><input type="number" min="15" max="90" step="5" value="${s.minutes}" data-minutes="${id}"><select data-focus="${id}">${opts}</select></div>`;
 }).join("");
 document.querySelectorAll("[data-dayon]").forEach(el=>el.addEventListener("change",e=>{state.schedule[e.target.dataset.dayon].on=e.target.checked;save()}));
 document.querySelectorAll("[data-minutes]").forEach(el=>el.addEventListener("change",e=>{state.schedule[e.target.dataset.minutes].minutes=Math.max(15,Math.min(90,Number(e.target.value)||30));save()}));
 document.querySelectorAll("[data-focus]").forEach(el=>el.addEventListener("change",e=>{state.schedule[e.target.dataset.focus].focus=e.target.value;save()}));
}
function renderMuscles(){
 $("muscleChecks").innerHTML=MUSCLES.map(([v,l])=>`<label class="chip"><input type="checkbox" value="${v}" ${state.priorities.includes(v)?"checked":""}>${l}</label>`).join("");
}
function loadProgramConfig(){
 $("programWeeks").value=String(state.programConfig.weeks);$("progressionSpeed").value=state.programConfig.progressionSpeed;$("deloadEvery").value=String(state.programConfig.deloadEvery);
}
function readPriorities(){
 const a=[...document.querySelectorAll("#muscleChecks input:checked")].map(x=>x.value);state.priorities=a.length?a:["full"];
}

function prescription(week,isDeload){
 const g=state.profile.goal,i=state.profile.intensity,x=state.profile.experience;
 let p={sets:3,reps:"10-15",work:40,rest:50,rpe:"7/10"};
 if(g==="hypertrophy")p={sets:3,reps:"8-15",work:45,rest:75,rpe:"7-8/10"};
 if(g==="conditioning")p={sets:3,reps:"por tiempo",work:40,rest:20,rpe:"7-8/10"};
 if(g==="strength")p={sets:4,reps:"6-10",work:40,rest:90,rpe:"8/10"};
 if(g==="endurance")p={sets:3,reps:"15-25",work:50,rest:35,rpe:"7-8/10"};
 if(i==="easy"){p.sets=Math.max(2,p.sets-1);p.work=Math.max(30,p.work-5);p.rest+=15;p.rpe="6/10"}
 if(i==="hard"){p.sets=Math.min(5,p.sets+1);p.work+=5;p.rest=Math.max(15,p.rest-5);p.rpe="8-9/10"}
 if(x==="beginner"){p.sets=Math.min(3,p.sets);p.rest+=15}
 if(x==="advanced"&&i!=="easy")p.sets=Math.min(5,p.sets+1);
 const step=state.programConfig.progressionSpeed==="conservative"?.5:state.programConfig.progressionSpeed==="aggressive"?1.4:1;
 const phase=Math.floor((week-1)/2);
 if(g==="conditioning"){p.work=Math.min(60,p.work+Math.round(phase*step*3));p.rest=Math.max(15,p.rest-Math.round(phase*step*2))}
 else p.sets=Math.min(5,p.sets+Math.floor(phase*step/2));
 if(isDeload){p.sets=Math.max(2,p.sets-1);p.work=Math.max(25,p.work-10);p.rest+=20;p.rpe="6/10"}
 return p;
}
function autoFocus(i,n){
 if(state.priorities.length===1&&state.priorities[0]!=="full")return state.priorities[0];
 if(n===2)return i===0?"upper":"lower";
 if(n===3)return ["upper","lower","full"][i%3];
 if(n>=4)return ["upper","lower","back","full"][i%4];
 return "full";
}
function compatible(ex){
 const bandOk=!state.bands.length||state.bands.some(b=>ex.types.includes(b.type)||b.type==="any");
 if(!bandOk)return false;
 const needs=ex.needs||[];
 if(needs.includes("anchor")&&!state.equipment.anchor)return false;
 if(needs.includes("chair")&&!state.equipment.chair)return false;
 if(needs.includes("mat")&&!state.equipment.mat)return false;
 return true
}
function chooseExercises(focus,minutes,di,week,usedThisWeek=new Set(),usedPrevWeek=new Set()){
 const targets=TARGET_MAP[focus]||TARGET_MAP.full,count=Math.max(3,Math.min(9,Math.round(minutes/6)));
 const scored=EXERCISES.filter(compatible).map(ex=>{
  let score=(targets.includes(ex.primary)?5:0)+ex.muscles.reduce((s,m)=>s+(targets.includes(m)?1.25:0),0);
  state.priorities.forEach(p=>{const pm=TARGET_MAP[p]||[p];if(pm.includes(ex.primary))score+=2.5;else if(ex.muscles.some(m=>pm.includes(m)))score+=.8});
  if(state.profile.experience==="beginner"&&ex.difficulty>1)score-=4;
  if(usedThisWeek.has(ex.id))score-=100;
  if(usedPrevWeek.has(ex.id))score-=5;
  score+=((Math.abs(hash(ex.id))+di*17+week*31)%29)/20;
  return {ex,score};
 }).sort((a,b)=>b.score-a.score);
 const out=[],primaryCount={},positionCount={},patternCount={};
 for(const x of scored){
  const ex=x.ex;if(usedThisWeek.has(ex.id))continue;
  const p=ex.primary||ex.muscles[0],pos=ex.position||"Otra",pat=ex.pattern||"otro";
  if((primaryCount[p]||0)>=2&&out.length<count-1)continue;
  if((positionCount[pos]||0)>=2&&out.length<count-1)continue;
  if((patternCount[pat]||0)>=1&&out.length<count-1)continue;
  out.push(ex);primaryCount[p]=(primaryCount[p]||0)+1;positionCount[pos]=(positionCount[pos]||0)+1;patternCount[pat]=(patternCount[pat]||0)+1;
  if(out.length>=count)break;
 }
 if(out.length<count){for(const x of scored){if(out.some(e=>e.id===x.ex.id)||usedThisWeek.has(x.ex.id))continue;out.push(x.ex);if(out.length>=count)break}}
 if(out.length<count){for(const x of scored){if(out.some(e=>e.id===x.ex.id))continue;out.push(x.ex);if(out.length>=count)break}}
 return out;
}
function learning(exid){return state.exerciseLearning[exid]||{bias:0,lastBandId:null,lastRating:null,sessions:0}}
function recommendBand(ex,isDeload=false){
 let compatibleBands=state.bands.filter(b=>ex.types.includes(b.type)||b.type==="any"); const preferred=compatibleBands.filter(b=>(ex.preferredTypes||[]).includes(b.type)); if(preferred.length)compatibleBands=preferred; const c=compatibleBands.sort((a,b)=>(a.kg??999)-(b.kg??999));
 if(!c.length)return {id:null,label:"Banda compatible que permita técnica limpia"};
 const l=learning(ex.id);let base=ex.load==="light"?.25:ex.load==="heavy"?.72:.5;
 base+=state.profile.intensity==="hard"?.10:state.profile.intensity==="easy"?-.10:0;base+=state.loadBias*.05+l.bias*.11;if(isDeload)base-=.12;base=Math.max(0,Math.min(1,base));
 let idx=Math.round(base*(c.length-1));
 const last=c.findIndex(b=>b.id===l.lastBandId);
 if(last>=0){if(l.lastRating==="easy")idx=Math.max(idx,Math.min(c.length-1,last+1));if(l.lastRating==="good")idx=last;if(l.lastRating==="hard")idx=Math.min(idx,Math.max(0,last-1))}
 idx=Math.max(0,Math.min(c.length-1,idx));const b=c[idx];return {id:b.id,label:`${b.name}${b.kg?` (${b.kg} kg aprox.)`:""} · ${bandTypeLabel(b.type)}`};
}
function makeSession(dayId,label,s,di,total,week,isDeload,usedThisWeek=new Set(),usedPrevWeek=new Set()){
 const focus=s.focus==="auto"?autoFocus(di,total):s.focus,p=prescription(week,isDeload);
 return {dayId,dayLabel:label,minutes:s.minutes,focus,goal:state.profile.goal,intensity:state.profile.intensity,week,isDeload,
  exercises:chooseExercises(focus,s.minutes,di,week,usedThisWeek,usedPrevWeek).map(ex=>({...ex,sets:p.sets,reps:p.reps,work:p.work,rest:p.rest,rpe:p.rpe,band:recommendBand(ex,isDeload)}))};
}
function generateProgram(){
 readPriorities();state.programConfig={weeks:Number($("programWeeks").value),progressionSpeed:$("progressionSpeed").value,deloadEvery:Number($("deloadEvery").value)};
 const active=DAYS.filter(([id])=>state.schedule[id].on);if(!active.length){alert("Selecciona al menos un día.");return}
 if(!state.bands.length&&!confirm("No has registrado bandas. Crearé el programa con recomendaciones genéricas. ¿Continuar?"))return;
 state.program=[];
 let prevWeekUsed=new Set();
 for(let w=1;w<=state.programConfig.weeks;w++){
  const del=state.programConfig.deloadEvery>0&&w%state.programConfig.deloadEvery===0,usedThisWeek=new Set(),sessions=[];
  active.forEach(([id,l],i)=>{const session=makeSession(id,l,state.schedule[id],i,active.length,w,del,usedThisWeek,prevWeekUsed);session.exercises.forEach(ex=>usedThisWeek.add(ex.id));sessions.push(session)});
  state.program.push({week:w,isDeload:del,sessions});prevWeekUsed=new Set(usedThisWeek);
 }
 state.currentWeek=1;viewWeek=1;recalcVolume();save();renderAll();$("programSaved").textContent="Programa creado";setTimeout(()=>$("programSaved").textContent="",1500);
}
$("generateProgram").addEventListener("click",generateProgram);
function recalcVolume(){const mv={};state.program.forEach(w=>w.sessions.forEach(s=>s.exercises.forEach(ex=>{const p=ex.primary||ex.muscles[0];mv[p]=(mv[p]||0)+ex.sets;(ex.secondary||[]).forEach(m=>mv[m]=(mv[m]||0)+ex.sets*.35)})));state.muscleVolume=mv}
function renderProgramOverview(){
 if(!state.program.length){$("programOverview").innerHTML='<p class="muted">Todavía no has creado un programa.</p>';return}
 const d=state.program.filter(w=>w.isDeload).map(w=>w.week),freq=state.program[0].sessions.length;
 $("programOverview").innerHTML=`<div class="metricgrid"><div class="metric">Duración<strong>${state.program.length} semanas</strong></div><div class="metric">Frecuencia<strong>${freq} días/semana</strong></div><div class="metric">Objetivo<strong>${goalLabel(state.profile.goal)}</strong></div></div><div class="weekBanner ${d.length?"deload":""}"><strong>Progresión:</strong> ${state.programConfig.progressionSpeed==="conservative"?"conservadora":state.programConfig.progressionSpeed==="aggressive"?"rápida":"normal"}.${d.length?` Semanas ligeras: ${d.join(", ")}.`:" Sin descarga programada."}</div>`;
}
function renderLibraryStats(){
 const list=EXERCISES.filter(compatible),positions=new Set(list.map(e=>e.position)).size;
 $("libraryStats").innerHTML=`<strong>Biblioteca activa:</strong> ${list.length} ejercicios compatibles con tus bandas y material · ${positions} posiciones corporales.<br><span class="muted">BandCoach evita repetir el mismo ejercicio dentro de una semana siempre que existan alternativas, penaliza repetirlo en la semana siguiente y mezcla patrones y posiciones.</span>`;
}
function renderWeek(){
 if(!state.program.length){$("weekLabel").textContent="Semana 1";$("generatedPlan").innerHTML='<p class="muted">No hay programa generado.</p>';return}
 viewWeek=Math.max(1,Math.min(state.program.length,viewWeek));const w=state.program[viewWeek-1];$("weekLabel").textContent=`Semana ${w.week}${w.isDeload?" · ligera":""}`;
 $("generatedPlan").innerHTML=`<div class="weekBanner ${w.isDeload?"deload":""}"><strong>${w.isDeload?"Semana de descarga":"Semana de progreso"}</strong><br><span class="muted">${w.isDeload?"Menos volumen y banda algo más suave.":"Progresión gradual según objetivo y respuestas."}</span></div>`+
 w.sessions.map(s=>`<div class="planDay"><div class="planHead"><div><strong>${s.dayLabel}</strong> · ${s.minutes} min · ${focusLabel(s.focus)}</div><span class="pill">${goalLabel(s.goal)}</span></div>${s.exercises.map(ex=>`<div class="exerciseRow"><strong>${ex.name}</strong><div class="exerciseMeta"><span class="mini">${ex.sets} series</span><span class="mini">${ex.reps}</span><span class="mini">${esc(ex.position)}</span><span class="mini">${esc(ANCHOR_LABELS[ex.anchor]||ex.anchor)}</span><span class="mini">trabajo ${ex.work}s</span><span class="mini">descanso ${ex.rest}s</span><span class="mini">${esc(ex.band.label)}</span></div></div>`).join("")}</div>`).join("");
}
$("prevWeek").addEventListener("click",()=>{viewWeek--;renderWeek()});$("nextWeek").addEventListener("click",()=>{viewWeek++;renderWeek()});

function jsDayId(){return ["sun","mon","tue","wed","thu","fri","sat"][new Date().getDay()]}
function currentWeekObj(){return state.program[state.currentWeek-1]||state.program[0]||null}
function todaySession(){const w=currentWeekObj();if(!w)return null;return w.sessions.find(s=>s.dayId===jsDayId())||w.sessions[0]||null}
function nextDeload(){const w=state.program.find(x=>x.isDeload&&x.week>=state.currentWeek);return w?`sem. ${w.week}`:"—"}
function renderStatus(){
 const done=state.history.filter(h=>h.completed).length,total=Math.max(1,(state.program[0]?.sessions.length||0)*state.program.length),pct=Math.min(100,Math.round(done/total*100));
 $("programStatus").innerHTML=`<div class="statusbox">Semana<strong>${state.program.length?state.currentWeek+" / "+state.program.length:"—"}</strong></div><div class="statusbox">Sesiones hechas<strong>${done}</strong></div><div class="statusbox">Adherencia<strong>${state.program.length?pct+"%":"—"}</strong></div><div class="statusbox">Próxima descarga<strong>${nextDeload()}</strong></div>`;
}
function renderToday(){
 const s=todaySession();renderStatus();
 if(!s){$("todayDay").textContent="Hoy";$("todayTitle").textContent="Configura tu programa";$("todaySummary").textContent="Añade tus bandas y crea un programa.";$("todayExercises").innerHTML='<p class="muted">No hay una sesión disponible.</p>';$("startToday").disabled=true;return}
 $("startToday").disabled=false;$("todayDay").textContent=`Semana ${s.week} · ${s.dayLabel}`;$("todayTitle").textContent=`${focusLabel(s.focus)} · ${goalLabel(s.goal)}`;$("todaySummary").textContent=`${s.minutes} min · ${s.exercises.length} ejercicios · ${s.isDeload?"semana ligera":"semana de progreso"}`;
 $("todayExercises").innerHTML='<h3>Sesión propuesta</h3>'+s.exercises.map(ex=>`<div class="exerciseRow exerciseWithThumb"><div class="exerciseThumb">${renderExerciseDiagram(ex)}</div><div class="exerciseText"><strong>${ex.name}</strong><br><span class="muted">${ex.description}</span><div class="exerciseMeta"><span class="mini">${ex.sets} × ${ex.reps}</span><span class="mini">${esc(ex.position)}</span><span class="mini">${esc(ANCHOR_LABELS[ex.anchor]||ex.anchor)}</span><span class="mini">${esc(ex.band.label)}</span></div></div></div>`).join("");
}


function svgEl(tag,attrs={}){return `<${tag} ${Object.entries(attrs).map(([k,v])=>`${k}="${v}"`).join(" ")}/>`}
function line(x1,y1,x2,y2,cls="body",extra=""){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" ${extra}/>`}
function circle(cx,cy,r=8,cls="bodyFill"){return `<circle cx="${cx}" cy="${cy}" r="${r}" class="${cls}"/>`}
function arrow(x1,y1,x2,y2){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="moveArrow" marker-end="url(#arrow)"/>`}
function bandLine(x1,y1,x2,y2){return line(x1,y1,x2,y2,"band")}

function poseFor(ex,phase,cx){
 const p=ex.position||"De pie", pat=ex.pattern||"";
 let head={x:cx,y:44}, neck={x:cx,y:55}, hip={x:cx,y:100};
 let ls={x:cx-12,y:62},rs={x:cx+12,y:62};
 let lh={x:cx-24,y:92},rh={x:cx+24,y:92};
 let lk={x:cx-12,y:132},rk={x:cx+12,y:132};
 let lf={x:cx-14,y:166},rf={x:cx+14,y:166};
 let le={x:(ls.x+lh.x)/2,y:(ls.y+lh.y)/2},re={x:(rs.x+rh.x)/2,y:(rs.y+rh.y)/2};
 let mode="standing", ground=172;

 if(p.includes("Sentado")){
   mode="seated";head.y=42;neck.y=53;hip.y=98;ls.y=60;rs.y=60;
   lk={x:cx-25,y:120};rk={x:cx+25,y:120};lf={x:cx-28,y:158};rf={x:cx+28,y:158};
   ground=160;
 }
 if(p.includes("Tumbado boca arriba")){
   mode="supine";head={x:cx-55,y:110};neck={x:cx-43,y:110};hip={x:cx+10,y:110};ls={x:cx-32,y:100};rs={x:cx-32,y:120};
   lk={x:cx+36,y:130};rk={x:cx+36,y:90};lf={x:cx+58,y:155};rf={x:cx+58,y:65};ground=160;
 }
 if(p.includes("Tumbado boca abajo")){
   mode="prone";head={x:cx-55,y:112};neck={x:cx-43,y:112};hip={x:cx+10,y:112};ls={x:cx-30,y:102};rs={x:cx-30,y:122};
   lk={x:cx+38,y:112};rk={x:cx+38,y:112};lf={x:cx+62,y:112};rf={x:cx+62,y:112};ground=135;
 }
 if(p.includes("Tumbado de lado")){
   mode="side";head={x:cx-50,y:112};neck={x:cx-38,y:112};hip={x:cx+5,y:112};ls={x:cx-28,y:102};rs={x:cx-28,y:122};
   lk={x:cx+32,y:118};rk={x:cx+32,y:105};lf={x:cx+58,y:125};rf={x:cx+58,y:98};ground=138;
 }
 if(p.includes("Cuadrupedia")){
   mode="quad";head={x:cx-42,y:82};neck={x:cx-30,y:88};hip={x:cx+15,y:100};ls={x:cx-22,y:94};rs={x:cx-22,y:104};
   lh={x:cx-28,y:145};rh={x:cx-12,y:145};lk={x:cx+28,y:130};rk={x:cx+42,y:130};lf={x:cx+25,y:155};rf={x:cx+48,y:155};ground=158;
 }
 if(p.includes("Arrodillado")||p.includes("Medio arrodillado")){
   mode="kneel";hip.y=105;lk={x:cx-15,y:140};lf={x:cx-28,y:155};
   if(p.includes("Medio")){rk={x:cx+25,y:132};rf={x:cx+34,y:158}}else{rk={x:cx+15,y:140};rf={x:cx+28,y:155}}
   ground=158;
 }
 if(p.includes("plancha")){
   mode="plank";head={x:cx-55,y:92};neck={x:cx-43,y:96};hip={x:cx+5,y:108};ls={x:cx-32,y:104};rs={x:cx-32,y:104};
   lh={x:cx-35,y:150};rh={x:cx-20,y:150};lk={x:cx+38,y:120};rk={x:cx+38,y:120};lf={x:cx+62,y:148};rf={x:cx+62,y:148};ground=152;
 }

 // Movement modifications. The goal is an orientation diagram, not anatomical precision.
 const end=phase==="end";
 if(["push_horizontal","fly"].includes(pat)){
   lh=end?{x:cx-4,y:72}:{x:cx-28,y:82};rh=end?{x:cx+4,y:72}:{x:cx+28,y:82};
 }
 if(pat==="fly_diagonal"){
   lh=end?{x:cx-5,y:62}:{x:cx-30,y:102};rh=end?{x:cx+5,y:62}:{x:cx+30,y:102};
 }
 if(["pull_horizontal","pull_high","reverse_fly","pull_high_external_rotation"].includes(pat)){
   lh=end?{x:cx-24,y:76}:{x:cx-5,y:76};rh=end?{x:cx+24,y:76}:{x:cx+5,y:76};
   if(pat==="pull_high_external_rotation"&&end){lh={x:cx-24,y:56};rh={x:cx+24,y:56}}
 }
 if(pat==="pull_vertical"){
   lh=end?{x:cx-17,y:72}:{x:cx-18,y:25};rh=end?{x:cx+17,y:72}:{x:cx+18,y:25};
 }
 if(pat==="shoulder_extension"){
   lh=end?{x:cx-18,y:105}:{x:cx-20,y:28};rh=end?{x:cx+18,y:105}:{x:cx+20,y:28};
 }
 if(pat==="push_vertical"){
   lh=end?{x:cx-16,y:24}:{x:cx-20,y:64};rh=end?{x:cx+16,y:24}:{x:cx+20,y:64};
 }
 if(["shoulder_abduction","scaption"].includes(pat)){
   lh=end?{x:cx-42,y:70}:{x:cx-18,y:100};rh=end?{x:cx+42,y:70}:{x:cx+18,y:100};
 }
 if(pat==="shoulder_flexion"){
   lh=end?{x:cx-18,y:55}:{x:cx-15,y:100};rh=end?{x:cx+18,y:55}:{x:cx+15,y:100};
 }
 if(["external_rotation","internal_rotation"].includes(pat)){
   lh={x:cx-15,y:78};rh=end?{x:cx+34,y:78}:{x:cx+10,y:92};
 }
 if(["elbow_flexion","elbow_flexion_neutral"].includes(pat)){
   lh=end?{x:cx-16,y:62}:{x:cx-18,y:105};rh=end?{x:cx+16,y:62}:{x:cx+18,y:105};
 }
 if(["elbow_extension","elbow_extension_overhead"].includes(pat)){
   if(pat==="elbow_extension_overhead"){lh=end?{x:cx-12,y:24}:{x:cx-8,y:52};rh=end?{x:cx+12,y:24}:{x:cx+8,y:52}}
   else {lh=end?{x:cx-18,y:105}:{x:cx-12,y:78};rh=end?{x:cx+18,y:105}:{x:cx+12,y:78}}
 }
 if(["squat","squat_wide","squat_overhead"].includes(pat)&&end){
   hip.y=120;lk.y=142;rk.y=142;lf.x=cx-28;rf.x=cx+28;
   if(pat==="squat_wide"){lk.x=cx-26;rk.x=cx+26;lf.x=cx-42;rf.x=cx+42}
   if(pat==="squat_overhead"){lh={x:cx-16,y:24};rh={x:cx+16,y:24}}
 }
 if(["lunge","lunge_dynamic"].includes(pat)&&end){lk={x:cx-28,y:135};lf={x:cx-34,y:165};rk={x:cx+24,y:142};rf={x:cx+50,y:165};hip.y=112}
 if(pat==="lunge_lateral"&&end){hip.y=112;lk={x:cx-30,y:137};lf={x:cx-48,y:165};rk={x:cx+38,y:126};rf={x:cx+58,y:165}}
 if(["hinge","hinge_unilateral"].includes(pat)&&end){head.x=cx+26;neck.x=cx+16;ls.x=cx+8;rs.x=cx+18;hip.x=cx-10;lh={x:cx+8,y:115};rh={x:cx+18,y:115};if(pat==="hinge_unilateral"){rk={x:cx+26,y:112};rf={x:cx+58,y:100}}}
 if(pat==="hip_extension"&&mode==="standing"&&end){rk={x:cx+12,y:132};rf={x:cx+42,y:146}}
 if(pat==="hip_extension"&&mode==="supine"&&end){hip.y=82;lk.y=112;rk.y=112}
 if(pat==="hip_abduction"&&end){rk={x:cx+30,y:130};rf={x:cx+52,y:150}}
 if(pat==="abduction_dynamic"&&end){lk.x=cx-26;rk.x=cx+26;lf.x=cx-36;rf.x=cx+36}
 if(pat==="knee_flexion"&&end){rf={x:rk.x+8,y:96}}
 if(pat==="knee_extension"&&end){rk={x:cx+35,y:120};rf={x:cx+60,y:120}}
 if(pat==="plantar_flexion"&&end){lf.y=160;rf.y=160;hip.y=94;head.y=38;neck.y=49;ls.y=56;rs.y=56}
 if(pat==="dorsiflexion"&&end){rf={x:rf.x+3,y:rf.y-12}}
 if(pat==="anti_rotation"&&end){lh={x:cx-5,y:78};rh={x:cx+5,y:78}}
 if(pat==="rotation_diagonal"){lh=end?{x:cx+24,y:55}:{x:cx-24,y:105};rh=end?{x:cx+32,y:60}:{x:cx-16,y:108}}
 if(pat==="anti_extension"&&mode==="supine"&&end){rf={x:cx+68,y:125};lf={x:cx+60,y:155}}
 if(pat==="trunk_flexion"&&end){head.x=cx+8;head.y=65;neck.x=cx+4;neck.y=74;ls.y=80;rs.y=80;hip.y=105}
 if(pat==="march"&&end){rk={x:cx+18,y:112};rf={x:cx+30,y:126}}
 if(pat==="contralateral"&&end){lh={x:cx-58,y:78};rf={x:cx+70,y:92}}

 // Recompute elbows after hand changes.
 le={x:(ls.x+lh.x)/2,y:(ls.y+lh.y)/2};re={x:(rs.x+rh.x)/2,y:(rs.y+rh.y)/2};
 return {head,neck,hip,ls,rs,le,re,lh,rh,lk,rk,lf,rf,mode,ground};
}

function drawPerson(p){
 let s='';
 s+=line(p.neck.x,p.neck.y,p.hip.x,p.hip.y);
 s+=circle(p.head.x,p.head.y,8);
 s+=line(p.ls.x,p.ls.y,p.le.x,p.le.y)+line(p.le.x,p.le.y,p.lh.x,p.lh.y);
 s+=line(p.rs.x,p.rs.y,p.re.x,p.re.y)+line(p.re.x,p.re.y,p.rh.x,p.rh.y);
 s+=line(p.hip.x,p.hip.y,p.lk.x,p.lk.y)+line(p.lk.x,p.lk.y,p.lf.x,p.lf.y);
 s+=line(p.hip.x,p.hip.y,p.rk.x,p.rk.y)+line(p.rk.x,p.rk.y,p.rf.x,p.rf.y);
 if(p.mode==="seated")s+=`<path d="M ${p.hip.x-28} 103 H ${p.hip.x+28} V 148" class="equipment"/>`;
 if(["supine","prone","side","quad","plank"].includes(p.mode))s+=line(p.head.x-15,p.ground,p.rf.x+12,p.ground,"ground");
 else s+=line(p.hip.x-55,p.ground,p.hip.x+55,p.ground,"ground");
 return s;
}

function drawBand(ex,p,phase){
 const a=ex.anchor||"ninguno",t=(ex.preferredTypes||ex.types||[])[0]||"long";
 let s='';
 if(a==="alto")s+=circle(p.hip.x-55,22,4,"anchorDot")+bandLine(p.hip.x-55,22,p.lh.x,p.lh.y);
 else if(a==="medio"||a==="medio-alto"||a==="cara")s+=circle(p.hip.x-58,72,4,"anchorDot")+bandLine(p.hip.x-58,72,p.lh.x,p.lh.y);
 else if(a==="bajo")s+=circle(p.hip.x-55,158,4,"anchorDot")+bandLine(p.hip.x-55,158,p.lh.x,p.lh.y);
 else if(a==="pies")s+=bandLine(p.lf.x,p.lf.y,p.lh.x,p.lh.y)+bandLine(p.rf.x,p.rf.y,p.rh.x,p.rh.y);
 else if(t==="mini")s+=bandLine(p.lk.x,p.lk.y,p.rk.x,p.rk.y);
 else if(["squat","squat_wide","hinge","hinge_unilateral","push_vertical","elbow_flexion","elbow_flexion_neutral","shoulder_abduction","shoulder_flexion","scaption","plantar_flexion"].includes(ex.pattern))s+=bandLine(p.lf.x,p.lf.y,p.lh.x,p.lh.y)+bandLine(p.rf.x,p.rf.y,p.rh.x,p.rh.y);
 return s;
}

function renderExerciseDiagram(ex){
 const p1=poseFor(ex,"start",105),p2=poseFor(ex,"end",315);
 const movement=arrow(180,92,240,92);
 return `<svg viewBox="0 0 420 200" role="img" aria-label="${esc(ex.name)}: esquema de posición inicial y final">
 <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" class="arrowHead"/></marker></defs>
 <text x="105" y="18" text-anchor="middle" class="diagramLabel">INICIO</text>
 <text x="315" y="18" text-anchor="middle" class="diagramLabel">FINAL</text>
 ${drawPerson(p1)}${drawBand(ex,p1,"start")}${movement}${drawPerson(p2)}${drawBand(ex,p2,"end")}
 <text x="210" y="192" text-anchor="middle" class="diagramMeta">${esc(ex.position)} · ${esc(ANCHOR_LABELS[ex.anchor]||ex.anchor)}</text>
 </svg>`;
}

function buildSteps(session){const st=[];session.exercises.forEach((ex,ei)=>{for(let set=1;set<=ex.sets;set++){st.push({phase:"work",seconds:ex.work,ex,set,totalSets:ex.sets,ei});if(!(ei===session.exercises.length-1&&set===ex.sets))st.push({phase:"rest",seconds:ex.rest,ex,set,totalSets:ex.sets,ei})}});return st}
function openCoach(s){activeSession={...s,steps:buildSteps(s),started:new Date().toISOString()};stepIndex=0;$("coachOverlay").classList.remove("hidden");showStep()}
$("startToday").addEventListener("click",()=>{const s=todaySession();if(s)openCoach(s)});
function nextWorkName(){for(let i=stepIndex+1;i<activeSession.steps.length;i++)if(activeSession.steps[i].phase==="work")return activeSession.steps[i].ex.name;return "fin"}
function showStep(){
 stopTimer();const st=activeSession.steps[stepIndex];if(!st){finishSession();return}
 remaining=st.seconds;initialSeconds=st.seconds;$("coachPhase").textContent=st.phase==="work"?"Trabajo":"Descanso";$("dockPhase").textContent=st.phase==="work"?"TRABAJO":"DESCANSO";$("coachDock").classList.toggle("restMode",st.phase!=="work");$("coachExercise").textContent=st.phase==="work"?st.ex.name:"Recupera";$("coachSet").textContent=st.phase==="work"?`Serie ${st.set} de ${st.totalSets} · objetivo ${st.ex.reps} · RPE ${st.ex.rpe}`:`Siguiente: ${nextWorkName()}`;
 $("bandRecommendation").innerHTML=st.phase==="work"?`<strong>Banda recomendada:</strong> ${esc(st.ex.band.label)}`:"<strong>Respira y prepárate.</strong> El descanso también entrena.";
 $("exerciseGuide").classList.toggle("hidden",st.phase!=="work");if(st.phase!=="work")$("exerciseSafetyBox").classList.add("hidden");
 if(st.phase==="work"){
 $("exerciseDescription").textContent=st.ex.description;
 $("exerciseDiagram").innerHTML=renderExerciseDiagram(st.ex);
 $("exerciseSetup").textContent=`${st.ex.bandSetup} · ${ANCHOR_LABELS[st.ex.anchor]||st.ex.anchor}. Posición: ${st.ex.position}.`;
 $("exerciseFeet").textContent=st.ex.feetStart;$("exerciseHands").textContent=st.ex.handsStart;$("exerciseExecution").textContent=st.ex.execution;$("exerciseFinish").textContent=st.ex.finish;$("exerciseBreathing").textContent=st.ex.breathing;
 $("exerciseCues").innerHTML=st.ex.cues.map(x=>`<li>${x}</li>`).join("");$("exerciseErrors").innerHTML=st.ex.errors.map(x=>`<li>${x}</li>`).join("");
 $("exerciseSafetyBox").classList.toggle("hidden",!st.ex.safety);$("exerciseSafety").textContent=st.ex.safety||"";
 }
 $("timerToggle").textContent="Iniciar";updateClock();$("sessionProgress").textContent=`Paso ${stepIndex+1} de ${activeSession.steps.length}`;
}
function updateClock(){const m=String(Math.floor(remaining/60)).padStart(2,"0"),s=String(remaining%60).padStart(2,"0");$("coachTimer").textContent=`${m}:${s}`;$("timerBar").style.width=`${initialSeconds?Math.max(0,remaining/initialSeconds*100):0}%`}
function beep(){try{const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);g.gain.value=.08;o.frequency.value=740;o.start();o.stop(c.currentTime+.12)}catch(e){}if(navigator.vibrate)navigator.vibrate([100,70,100])}
function startTimer(){if(running)return;running=true;$("timerToggle").textContent="Pausar";timerHandle=setInterval(()=>{remaining--;updateClock();if(remaining<=0){stopTimer();beep();handleDone()}},1000)}
function stopTimer(){if(timerHandle)clearInterval(timerHandle);timerHandle=null;running=false}
function handleDone(){
 const st=activeSession.steps[stepIndex];
 if(st.phase==="work"&&st.set===st.totalSets){pendingFeedbackExercise=st.ex;$("feedbackTitle").textContent=`${st.ex.name}: ¿cómo fue?`;$("feedbackBand").textContent=`Banda usada: ${st.ex.band.label}`;$("actualReps").value="";$("exerciseNote").value="";$("exerciseFeedbackOverlay").classList.remove("hidden");return}
 stepIndex++;setTimeout(showStep,220);
}
$("timerToggle").addEventListener("click",()=>running?stopTimer():startTimer());$("add15").addEventListener("click",()=>{remaining+=15;initialSeconds+=15;updateClock()});$("nextStep").addEventListener("click",()=>{stopTimer();handleDone()});
$("closeCoach").addEventListener("click",()=>{stopTimer();if(confirm("¿Salir de la sesión? No se marcará como completada."))$("coachOverlay").classList.add("hidden")});

document.querySelectorAll("[data-exrating]").forEach(b=>b.addEventListener("click",()=>{
 if(!pendingFeedbackExercise)return;const r=b.dataset.exrating,ex=pendingFeedbackExercise,l=learning(ex.id);
 if(r==="easy")l.bias=Math.min(2,(l.bias||0)+1);if(r==="hard")l.bias=Math.max(-2,(l.bias||0)-1);if(r==="good")l.bias=0;
 l.lastBandId=ex.band.id;l.lastRating=r;l.sessions=(l.sessions||0)+1;l.lastReps=$("actualReps").value.trim();l.note=$("exerciseNote").value.trim();l.updated=new Date().toISOString();state.exerciseLearning[ex.id]=l;save();
 $("exerciseFeedbackOverlay").classList.add("hidden");pendingFeedbackExercise=null;stepIndex++;setTimeout(showStep,220);
}));
function finishSession(){stopTimer();$("coachOverlay").classList.add("hidden");$("finishOverlay").classList.remove("hidden")}
document.querySelectorAll("[data-rating]").forEach(b=>b.addEventListener("click",()=>{
 const r=b.dataset.rating;if(r==="easy")state.loadBias=Math.min(2,state.loadBias+1);if(r==="hard")state.loadBias=Math.max(-2,state.loadBias-1);if(r==="good")state.loadBias=0;
 state.history.push({date:new Date().toLocaleString("es-ES"),day:activeSession.dayLabel,week:activeSession.week,focus:focusLabel(activeSession.focus),goal:goalLabel(activeSession.goal),minutes:activeSession.minutes,exercises:activeSession.exercises.length,rating:r,completed:true});
 advanceWeek(activeSession.week);save();$("finishOverlay").classList.add("hidden");renderAll();alert("Sesión guardada. BandCoach ha aprendido de tus respuestas.");
}));
function advanceWeek(w){
 const wo=state.program[w-1];if(!wo)return;const days=new Set(state.history.filter(h=>h.completed&&h.week===w).map(h=>h.day));
 if(days.size>=wo.sessions.length&&w<state.program.length){state.currentWeek=w+1;viewWeek=state.currentWeek;for(let wi=state.currentWeek-1;wi<state.program.length;wi++)state.program[wi].sessions.forEach(s=>s.exercises.forEach(ex=>ex.band=recommendBand(ex,state.program[wi].isDeload)))}
}

function renderExerciseProgress(){
 const entries=Object.entries(state.exerciseLearning);
 if(!entries.length){$("exerciseProgress").innerHTML='<p class="muted">Completa una sesión y valora cada ejercicio.</p>';return}
 $("exerciseProgress").innerHTML=entries.sort((a,b)=>(b[1].sessions||0)-(a[1].sessions||0)).map(([id,l])=>{const ex=EXERCISES.find(e=>e.id===id),band=state.bands.find(b=>b.id===l.lastBandId),cls=l.lastRating==="easy"?"badgeEasy":l.lastRating==="hard"?"badgeHard":"badgeGood";return `<div class="progressItem"><strong>${ex?ex.name:id}</strong><div class="exerciseMeta"><span class="${cls}">${ratingLabel(l.lastRating)}</span><span class="mini">${l.sessions||0} sesiones</span>${band?`<span class="mini">última banda: ${esc(band.name)}</span>`:""}${l.lastReps?`<span class="mini">reps: ${esc(l.lastReps)}</span>`:""}</div>${l.note?`<div class="muted">Nota: ${esc(l.note)}</div>`:""}</div>`}).join("");
}
function renderMuscleProgress(){
 const labels=Object.fromEntries(MUSCLES),d=Object.entries(state.muscleVolume||{}).filter(([m])=>labels[m]).sort((a,b)=>b[1]-a[1]);
 if(!d.length){$("muscleProgress").innerHTML='<p class="muted">Genera un programa para ver el volumen.</p>';return}
 const max=Math.max(...d.map(x=>x[1]),1);$("muscleProgress").innerHTML=d.map(([m,v])=>`<div class="progressItem"><strong>${labels[m]}</strong><div class="progressbar"><div style="width:${Math.round(v/max*100)}%"></div></div><span class="muted">${v} series programadas</span></div>`).join("");
}
function renderHistory(){
 if(!state.history.length){$("historyList").innerHTML='<p class="muted">Aún no hay sesiones completadas.</p>';return}
 $("historyList").innerHTML=[...state.history].reverse().map(h=>`<div class="historyItem"><strong>${h.date}</strong> · semana ${h.week} · ${h.day}<br><span class="muted">${h.focus} · ${h.goal} · ${h.minutes} min · ${h.exercises} ejercicios · ${ratingLabel(h.rating)}</span></div>`).join("");
}
function download(name,text,type){const blob=new Blob([text],{type}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$("exportCsv").addEventListener("click",()=>{const rows=[["fecha","semana","dia","enfoque","objetivo","minutos","ejercicios","valoracion"],...state.history.map(h=>[h.date,h.week,h.day,h.focus,h.goal,h.minutes,h.exercises,h.rating])];download("bandcoach_historial.csv",rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"),"text/csv;charset=utf-8")});
$("exportJson").addEventListener("click",()=>download("bandcoach_backup.json",JSON.stringify(state,null,2),"application/json"));
$("clearHistory").addEventListener("click",()=>{if(confirm("¿Borrar historial y aprendizaje?")){state.history=[];state.exerciseLearning={};state.loadBias=0;state.currentWeek=1;save();renderAll()}});

let deferredPrompt=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});
$("installBtn").addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").classList.add("hidden")});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});

function renderAll(){loadProfile();loadProgramConfig();loadEquipment();renderBands();renderSchedule();renderMuscles();renderProgramOverview();renderLibraryStats();renderWeek();renderToday();renderExerciseProgress();renderMuscleProgress();renderHistory()}
renderAll();
