
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
const EXERCISES = [
  {id:"squat",name:"Sentadilla con banda",muscles:["legs","glutes","core"],types:["long","tube","any"],difficulty:1,load:"heavy",
   description:"Patrón básico de pierna para cuádriceps, glúteos y estabilidad del tronco.",
   setup:"Pisa la banda con ambos pies. Lleva el otro extremo a hombros o sujétalo con las manos. Pies algo más abiertos que las caderas.",
   execution:"Lleva la cadera atrás y abajo, mantén el pecho estable y empuja el suelo para volver arriba.",
   cues:["Rodillas siguiendo la dirección de los pies.","Mantén tensión abdominal.","Sube sin perder la postura."],
   errors:["Colapsar las rodillas hacia dentro.","Redondear la espalda.","Elegir tanta tensión que acortes demasiado el recorrido."]},
  {id:"rdl",name:"Peso muerto rumano con banda",muscles:["glutes","legs","back","core"],types:["long","tube","any"],difficulty:1,load:"heavy",
   description:"Bisagra de cadera para glúteos, isquios y cadena posterior.",
   setup:"Pisa la banda y sujeta los extremos. Rodillas ligeramente flexionadas, espalda larga.",
   execution:"Lleva la cadera atrás manteniendo la banda cerca del cuerpo. Vuelve extendiendo la cadera y apretando glúteos.",
   cues:["Piensa en cerrar una puerta con la cadera.","Cuello neutro.","Siente tensión en isquios."],
   errors:["Convertirlo en sentadilla.","Tirar con la zona lumbar.","Subir arqueando exageradamente la espalda."]},
  {id:"row",name:"Remo con banda",muscles:["back","arms","shoulders"],types:["long","tube","any"],difficulty:1,load:"medium",
   description:"Trabajo principal de espalda y bíceps, muy útil para compensar posturas prolongadas.",
   setup:"Ancla la banda delante o pásala por un punto estable. Brazos extendidos, pecho alto.",
   execution:"Lleva los codos hacia atrás y acerca las manos al tronco. Regresa de forma lenta.",
   cues:["Hombros lejos de las orejas.","Pausa atrás un instante.","Tronco quieto."],
   errors:["Encoger hombros.","Balancear el cuerpo.","Soltar la vuelta sin control."]},
  {id:"chestpress",name:"Press de pecho con banda",muscles:["chest","shoulders","arms","core"],types:["long","tube","any"],difficulty:1,load:"medium",
   description:"Empuje horizontal para pectoral, tríceps y hombro anterior.",
   setup:"Ancla la banda detrás a una altura segura. Coloca las manos a ambos lados del pecho.",
   execution:"Empuja hacia delante hasta extender los brazos sin bloquear violentamente los codos. Vuelve con control.",
   cues:["Costillas controladas.","Muñecas alineadas.","Mantén tensión continua."],
   errors:["Arquear demasiado la espalda.","Elevar los hombros.","Usar un anclaje inestable."]},
  {id:"ohpress",name:"Press de hombro con banda",muscles:["shoulders","arms","core"],types:["long","tube","any"],difficulty:2,load:"medium",
   description:"Empuje vertical para hombros y tríceps con trabajo de estabilidad del tronco.",
   setup:"Pisa la banda y coloca las manos a la altura de los hombros.",
   execution:"Empuja las manos arriba sin arquear la zona lumbar. Baja lentamente.",
   cues:["Glúteos y abdomen activos.","Cabeza neutra.","Controla la bajada."],
   errors:["Arquear la espalda.","Subir un hombro antes que el otro.","Usar demasiada tensión."]},
  {id:"latpulldown",name:"Jalón al pecho con banda",muscles:["back","arms"],types:["long","tube","any"],difficulty:1,load:"medium",
   description:"Trabajo de dorsal ancho y bíceps con un patrón de tracción vertical.",
   setup:"Ancla la banda por encima de la cabeza de forma segura. Brazos altos y tronco estable.",
   execution:"Lleva los codos hacia los costados y las manos hacia la parte alta del pecho.",
   cues:["Codos hacia los bolsillos.","Pecho estable.","Controla la subida."],
   errors:["Tirar detrás de la nuca.","Balancear el tronco.","Encoger los hombros."]},
  {id:"facepull",name:"Face pull",muscles:["back","shoulders","arms"],types:["long","tube","any"],difficulty:1,load:"light",
   description:"Trabajo de espalda alta y hombro posterior, excelente para postura y estabilidad escapular.",
   setup:"Ancla la banda a la altura de la cara. Sujeta con las manos separadas.",
   execution:"Tira hacia la cara abriendo las manos y llevando los codos hacia fuera.",
   cues:["Pecho estable.","Termina con manos cerca de las sienes.","Movimiento limpio, sin tirón."],
   errors:["Subir los hombros.","Hiperextender la espalda.","Usar tanta tensión que pierdas la rotación externa."]},
  {id:"biceps",name:"Curl de bíceps con banda",muscles:["arms"],types:["long","tube","any"],difficulty:1,load:"light",
   description:"Flexión de codo para bíceps con tensión progresiva.",
   setup:"Pisa la banda y sujeta los extremos con palmas hacia delante.",
   execution:"Flexiona los codos sin moverlos hacia delante. Baja en 2-3 segundos.",
   cues:["Codos pegados al cuerpo.","No balancees el tronco.","Aprieta arriba sin perder postura."],
   errors:["Mover los codos.","Usar impulso.","Soltar la fase de bajada."]},
  {id:"triceps",name:"Extensión de tríceps",muscles:["arms","shoulders"],types:["long","tube","any"],difficulty:1,load:"light",
   description:"Extensión de codo para tríceps.",
   setup:"Ancla la banda arriba o colócala detrás de la cabeza según el modelo.",
   execution:"Extiende los codos manteniendo la parte alta del brazo relativamente fija.",
   cues:["Controla el hombro.","Extiende sin bloquear con violencia.","Vuelve despacio."],
   errors:["Abrir excesivamente los codos.","Mover todo el brazo.","Tensión excesiva."]},
  {id:"lateralraise",name:"Elevación lateral",muscles:["shoulders"],types:["long","tube","any"],difficulty:1,load:"light",
   description:"Trabajo específico de la porción lateral del hombro.",
   setup:"Pisa la banda con uno o ambos pies. Brazos a los lados.",
   execution:"Eleva los brazos hasta aproximadamente la altura de los hombros y baja lentamente.",
   cues:["Codos ligeramente flexionados.","Hombros abajo.","Movimiento suave."],
   errors:["Subir por encima de lo necesario.","Balancear el cuerpo.","Encoger hombros."]},
  {id:"split",name:"Split squat con banda",muscles:["legs","glutes","core"],types:["long","tube","any"],difficulty:2,load:"heavy",
   description:"Trabajo unilateral para pierna y glúteo, además de equilibrio y control.",
   setup:"Adopta una posición de zancada estable y coloca la banda para añadir resistencia al subir.",
   execution:"Desciende verticalmente y empuja con el pie delantero para volver arriba.",
   cues:["Pie delantero completo apoyado.","Rodilla estable.","Tronco alto."],
   errors:["Perder equilibrio por ir demasiado estrecho.","Rodilla hacia dentro.","Acortar el recorrido por exceso de banda."]},
  {id:"glutebridge",name:"Puente de glúteo con banda",muscles:["glutes","legs","core"],types:["mini","long","any"],difficulty:1,load:"medium",
   description:"Extensión de cadera centrada en glúteos.",
   setup:"Túmbate boca arriba, pies apoyados. Coloca minibanda sobre las rodillas si la tienes.",
   execution:"Eleva la cadera apretando glúteos y mantén una breve pausa arriba.",
   cues:["Costillas controladas.","Rodillas estables.","Pausa arriba."],
   errors:["Empujar desde la zona lumbar.","Separar demasiado los pies.","Perder tensión en la banda."]},
  {id:"lateralwalk",name:"Caminata lateral con minibanda",muscles:["glutes","legs"],types:["mini","any"],difficulty:1,load:"medium",
   description:"Trabajo de glúteo medio para estabilidad de pelvis y rodilla.",
   setup:"Coloca la minibanda sobre rodillas o tobillos. Flexiona ligeramente cadera y rodillas.",
   execution:"Da pasos laterales cortos manteniendo tensión constante.",
   cues:["Pelvis nivelada.","Pies paralelos.","Pasos controlados."],
   errors:["Juntar completamente los pies.","Balancear el tronco.","Dejar caer las rodillas hacia dentro."]},
  {id:"kickback",name:"Extensión de cadera / kickback",muscles:["glutes","legs","core"],types:["mini","long","tube","any"],difficulty:1,load:"medium",
   description:"Trabajo de glúteo mayor con énfasis en extensión de cadera.",
   setup:"Sujeta la banda de forma segura al pie o tobillo y estabiliza el tronco.",
   execution:"Lleva la pierna hacia atrás sin arquear la espalda. Regresa lentamente.",
   cues:["Cadera mirando al frente.","Abdomen activo.","Recorrido controlado."],
   errors:["Arquear la espalda.","Girar la pelvis.","Mover demasiado rápido."]},
  {id:"pallof",name:"Pallof press",muscles:["core","shoulders"],types:["long","tube","any"],difficulty:1,load:"medium",
   description:"Ejercicio anti-rotación para fortalecer el core de manera funcional.",
   setup:"Ancla la banda a un lado a la altura del pecho. Colócate de lado al anclaje.",
   execution:"Aleja las manos del pecho sin permitir que el tronco gire.",
   cues:["Pelvis y hombros de frente.","Respira sin perder tensión.","Brazos salen en línea recta."],
   errors:["Rotar hacia el anclaje.","Inclinarse.","Elegir demasiada tensión."]},
  {id:"woodchop",name:"Wood chop con banda",muscles:["core","shoulders","back"],types:["long","tube","any"],difficulty:2,load:"medium",
   description:"Patrón diagonal controlado para core y cintura escapular.",
   setup:"Ancla la banda a un lado. Colócate estable y con tensión moderada.",
   execution:"Mueve las manos en diagonal mientras el tronco rota de forma controlada.",
   cues:["Movimiento desde tronco y cadera.","Rodillas blandas.","Controla el regreso."],
   errors:["Tirar solo con brazos.","Girar bruscamente.","Perder el equilibrio."]},
  {id:"deadbug",name:"Dead bug con banda",muscles:["core"],types:["long","tube","any"],difficulty:2,load:"light",
   description:"Control del tronco y coordinación con resistencia de banda.",
   setup:"Túmbate boca arriba. Usa la banda como resistencia de brazos o anclada según tu configuración.",
   execution:"Mueve brazo y pierna contrarios sin perder el control de la zona lumbar.",
   cues:["Respira despacio.","Lumbar estable.","Menos rango si pierdes control."],
   errors:["Arquear la zona lumbar.","Ir demasiado rápido.","Tirar del cuello."]},
  {id:"goodmorning",name:"Buenos días con banda",muscles:["glutes","legs","back","core"],types:["long","tube","any"],difficulty:1,load:"heavy",
   description:"Bisagra de cadera sencilla para cadena posterior.",
   setup:"Pisa la banda y pásala por la parte alta de la espalda de forma cómoda.",
   execution:"Lleva la cadera atrás con espalda larga y vuelve extendiendo la cadera.",
   cues:["Rodillas ligeramente flexionadas.","Cadera atrás.","Sube apretando glúteos."],
   errors:["Redondear espalda.","Flexionar demasiado las rodillas.","Sobrecargar cuello con la banda."]},
  {id:"pullapart",name:"Band pull-apart",muscles:["back","shoulders"],types:["long","any"],difficulty:1,load:"light",
   description:"Trabajo sencillo de espalda alta y hombro posterior.",
   setup:"Sujeta una banda ligera delante del pecho con brazos casi extendidos.",
   execution:"Separa las manos hasta acercar la banda al pecho y vuelve lentamente.",
   cues:["Hombros abajo.","Pecho estable.","Usa banda ligera."],
   errors:["Arquear la espalda.","Flexionar mucho los codos.","Hacer rebotes."]}
];

const defaultState={
 profile:{age:"",weight:"",height:"",experience:"intermediate",goal:"hypertrophy",intensity:"moderate"},
 bands:[],
 schedule:{mon:{on:true,minutes:30,focus:"auto"},tue:{on:false,minutes:30,focus:"auto"},wed:{on:true,minutes:30,focus:"auto"},thu:{on:false,minutes:30,focus:"auto"},fri:{on:true,minutes:30,focus:"auto"},sat:{on:false,minutes:30,focus:"auto"},sun:{on:false,minutes:30,focus:"auto"}},
 priorities:["full"],
 programConfig:{weeks:8,progressionSpeed:"normal",deloadEvery:4},
 program:[], currentWeek:1, history:[], exerciseLearning:{}, muscleVolume:{}, loadBias:0
};
let saved=JSON.parse(localStorage.getItem("bandcoach_v3")||"null");
if(!saved){
 const old=JSON.parse(localStorage.getItem("bandcoach_v2")||"null");
 saved=old?{...defaultState,...old,programConfig:defaultState.programConfig,program:[],currentWeek:1,exerciseLearning:{},muscleVolume:{}}:defaultState;
}
let state={...defaultState,...saved,profile:{...defaultState.profile,...(saved.profile||{})},schedule:{...defaultState.schedule,...(saved.schedule||{})},programConfig:{...defaultState.programConfig,...(saved.programConfig||{})}};
let viewWeek=state.currentWeek||1,activeSession=null,stepIndex=0,remaining=0,initialSeconds=0,timerHandle=null,running=false,pendingFeedbackExercise=null;

function save(){localStorage.setItem("bandcoach_v3",JSON.stringify(state))}
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
function compatible(ex){return !state.bands.length||state.bands.some(b=>ex.types.includes(b.type)||ex.types.includes("any")||b.type==="any")}
function chooseExercises(focus,minutes,di,week){
 const targets=TARGET_MAP[focus]||TARGET_MAP.full,count=Math.max(3,Math.min(9,Math.round(minutes/6)));
 const scored=EXERCISES.filter(compatible).map(ex=>{
  let score=ex.muscles.reduce((s,m)=>s+(targets.includes(m)?3:0),0);
  state.priorities.forEach(p=>{const pm=TARGET_MAP[p]||[p];if(ex.muscles.some(m=>pm.includes(m)))score+=2});
  if(state.profile.experience==="beginner"&&ex.difficulty>1)score-=3;
  return {ex,score:score+((hash(ex.id)+di*7+week*11)%13)/20};
 }).sort((a,b)=>b.score-a.score);
 const out=[],mc={};
 for(const x of scored){const main=x.ex.muscles.find(m=>targets.includes(m))||x.ex.muscles[0];if((mc[main]||0)>=2&&out.length<count-1)continue;out.push(x.ex);mc[main]=(mc[main]||0)+1;if(out.length>=count)break}
 return out;
}
function learning(exid){return state.exerciseLearning[exid]||{bias:0,lastBandId:null,lastRating:null,sessions:0}}
function recommendBand(ex,isDeload=false){
 const c=state.bands.filter(b=>ex.types.includes(b.type)||ex.types.includes("any")||b.type==="any").sort((a,b)=>(a.kg??999)-(b.kg??999));
 if(!c.length)return {id:null,label:"Banda compatible que permita técnica limpia"};
 const l=learning(ex.id);let base=ex.load==="light"?.25:ex.load==="heavy"?.72:.5;
 base+=state.profile.intensity==="hard"?.10:state.profile.intensity==="easy"?-.10:0;base+=state.loadBias*.05+l.bias*.11;if(isDeload)base-=.12;base=Math.max(0,Math.min(1,base));
 let idx=Math.round(base*(c.length-1));
 const last=c.findIndex(b=>b.id===l.lastBandId);
 if(last>=0){if(l.lastRating==="easy")idx=Math.max(idx,Math.min(c.length-1,last+1));if(l.lastRating==="good")idx=last;if(l.lastRating==="hard")idx=Math.min(idx,Math.max(0,last-1))}
 idx=Math.max(0,Math.min(c.length-1,idx));const b=c[idx];return {id:b.id,label:`${b.name}${b.kg?` (${b.kg} kg aprox.)`:""} · ${bandTypeLabel(b.type)}`};
}
function makeSession(dayId,label,s,di,total,week,isDeload){
 const focus=s.focus==="auto"?autoFocus(di,total):s.focus,p=prescription(week,isDeload);
 return {dayId,dayLabel:label,minutes:s.minutes,focus,goal:state.profile.goal,intensity:state.profile.intensity,week,isDeload,
  exercises:chooseExercises(focus,s.minutes,di,week).map(ex=>({...ex,sets:p.sets,reps:p.reps,work:p.work,rest:p.rest,rpe:p.rpe,band:recommendBand(ex,isDeload)}))};
}
function generateProgram(){
 readPriorities();state.programConfig={weeks:Number($("programWeeks").value),progressionSpeed:$("progressionSpeed").value,deloadEvery:Number($("deloadEvery").value)};
 const active=DAYS.filter(([id])=>state.schedule[id].on);if(!active.length){alert("Selecciona al menos un día.");return}
 if(!state.bands.length&&!confirm("No has registrado bandas. Crearé el programa con recomendaciones genéricas. ¿Continuar?"))return;
 state.program=[];
 for(let w=1;w<=state.programConfig.weeks;w++){const del=state.programConfig.deloadEvery>0&&w%state.programConfig.deloadEvery===0;state.program.push({week:w,isDeload:del,sessions:active.map(([id,l],i)=>makeSession(id,l,state.schedule[id],i,active.length,w,del))})}
 state.currentWeek=1;viewWeek=1;recalcVolume();save();renderAll();$("programSaved").textContent="Programa creado";setTimeout(()=>$("programSaved").textContent="",1500);
}
$("generateProgram").addEventListener("click",generateProgram);
function recalcVolume(){const mv={};state.program.forEach(w=>w.sessions.forEach(s=>s.exercises.forEach(ex=>ex.muscles.forEach(m=>mv[m]=(mv[m]||0)+ex.sets))));state.muscleVolume=mv}
function renderProgramOverview(){
 if(!state.program.length){$("programOverview").innerHTML='<p class="muted">Todavía no has creado un programa.</p>';return}
 const d=state.program.filter(w=>w.isDeload).map(w=>w.week),freq=state.program[0].sessions.length;
 $("programOverview").innerHTML=`<div class="metricgrid"><div class="metric">Duración<strong>${state.program.length} semanas</strong></div><div class="metric">Frecuencia<strong>${freq} días/semana</strong></div><div class="metric">Objetivo<strong>${goalLabel(state.profile.goal)}</strong></div></div><div class="weekBanner ${d.length?"deload":""}"><strong>Progresión:</strong> ${state.programConfig.progressionSpeed==="conservative"?"conservadora":state.programConfig.progressionSpeed==="aggressive"?"rápida":"normal"}.${d.length?` Semanas ligeras: ${d.join(", ")}.`:" Sin descarga programada."}</div>`;
}
function renderWeek(){
 if(!state.program.length){$("weekLabel").textContent="Semana 1";$("generatedPlan").innerHTML='<p class="muted">No hay programa generado.</p>';return}
 viewWeek=Math.max(1,Math.min(state.program.length,viewWeek));const w=state.program[viewWeek-1];$("weekLabel").textContent=`Semana ${w.week}${w.isDeload?" · ligera":""}`;
 $("generatedPlan").innerHTML=`<div class="weekBanner ${w.isDeload?"deload":""}"><strong>${w.isDeload?"Semana de descarga":"Semana de progreso"}</strong><br><span class="muted">${w.isDeload?"Menos volumen y banda algo más suave.":"Progresión gradual según objetivo y respuestas."}</span></div>`+
 w.sessions.map(s=>`<div class="planDay"><div class="planHead"><div><strong>${s.dayLabel}</strong> · ${s.minutes} min · ${focusLabel(s.focus)}</div><span class="pill">${goalLabel(s.goal)}</span></div>${s.exercises.map(ex=>`<div class="exerciseRow"><strong>${ex.name}</strong><div class="exerciseMeta"><span class="mini">${ex.sets} series</span><span class="mini">${ex.reps}</span><span class="mini">trabajo ${ex.work}s</span><span class="mini">descanso ${ex.rest}s</span><span class="mini">${esc(ex.band.label)}</span></div></div>`).join("")}</div>`).join("");
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
 $("todayExercises").innerHTML='<h3>Sesión propuesta</h3>'+s.exercises.map(ex=>`<div class="exerciseRow"><strong>${ex.name}</strong><br><span class="muted">${ex.description}</span><div class="exerciseMeta"><span class="mini">${ex.sets} × ${ex.reps}</span><span class="mini">${esc(ex.band.label)}</span></div></div>`).join("");
}

function buildSteps(session){const st=[];session.exercises.forEach((ex,ei)=>{for(let set=1;set<=ex.sets;set++){st.push({phase:"work",seconds:ex.work,ex,set,totalSets:ex.sets,ei});if(!(ei===session.exercises.length-1&&set===ex.sets))st.push({phase:"rest",seconds:ex.rest,ex,set,totalSets:ex.sets,ei})}});return st}
function openCoach(s){activeSession={...s,steps:buildSteps(s),started:new Date().toISOString()};stepIndex=0;$("coachOverlay").classList.remove("hidden");showStep()}
$("startToday").addEventListener("click",()=>{const s=todaySession();if(s)openCoach(s)});
function nextWorkName(){for(let i=stepIndex+1;i<activeSession.steps.length;i++)if(activeSession.steps[i].phase==="work")return activeSession.steps[i].ex.name;return "fin"}
function showStep(){
 stopTimer();const st=activeSession.steps[stepIndex];if(!st){finishSession();return}
 remaining=st.seconds;initialSeconds=st.seconds;$("coachPhase").textContent=st.phase==="work"?"Trabajo":"Descanso";$("coachExercise").textContent=st.phase==="work"?st.ex.name:"Recupera";$("coachSet").textContent=st.phase==="work"?`Serie ${st.set} de ${st.totalSets} · objetivo ${st.ex.reps} · RPE ${st.ex.rpe}`:`Siguiente: ${nextWorkName()}`;
 $("bandRecommendation").innerHTML=st.phase==="work"?`<strong>Banda recomendada:</strong> ${esc(st.ex.band.label)}`:"<strong>Respira y prepárate.</strong> El descanso también entrena.";
 $("exerciseGuide").classList.toggle("hidden",st.phase!=="work");
 if(st.phase==="work"){$("exerciseDescription").textContent=st.ex.description;$("exerciseSetup").textContent=st.ex.setup;$("exerciseExecution").textContent=st.ex.execution;$("exerciseCues").innerHTML=st.ex.cues.map(x=>`<li>${x}</li>`).join("");$("exerciseErrors").innerHTML=st.ex.errors.map(x=>`<li>${x}</li>`).join("")}
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

function renderAll(){loadProfile();loadProgramConfig();renderBands();renderSchedule();renderMuscles();renderProgramOverview();renderWeek();renderToday();renderExerciseProgress();renderMuscleProgress();renderHistory()}
renderAll();
