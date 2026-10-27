import {t,lang,setLanguage} from './i18n.js';
import {createCase,applyEvent,restoreCase} from './care-model.js';
import {CareView} from './care-view.js';
const $=id=>document.getElementById(id),storageKey='siseon-care-demo-v3';
const colors=['#b9f8dc','#91bbf7','#b8a0c3'];
let state={stage:'intro'},caseState=null,storageAvailable=true,scene=null,busy=false,transitionId=0;
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,paused=reduced;const buttons=[];
try{caseState=restoreCase(localStorage.getItem(storageKey));}catch{storageAvailable=false;}
const care=new CareView($('care'),{dispatch:event=>{caseState=applyEvent(caseState,event);save();care.show(caseState,storageAvailable);},onReset:()=>$('reset-dialog').showModal(),onBurst:()=>scene?.burst()});
function save(){try{localStorage.setItem(storageKey,JSON.stringify(caseState));storageAvailable=true;}catch{storageAvailable=false;}}
function setPhase(phase){document.querySelectorAll('[data-phase]').forEach(el=>el.classList.toggle('active',Number(el.dataset.phase)===phase));}
function localize(){setLanguage(lang());$('language').value=lang();$('brand-name').textContent=t('brand');$('brand-sub').textContent=t('brandSub');$('home').setAttribute('aria-label',t('restart'));$('restart').textContent=t('restart')+' ↗';$('enter').textContent=t('enter')+' ↗';$('skip').textContent=t('skip');$('resume').textContent=t('resume')+' →';$('back').textContent='← '+t('back');$('possibility').textContent=t('possibility');$('phase-connect').textContent=t('connected');$('phase-choose').textContent=t('choose');$('phase-line').textContent=t('myLine');$('interaction-hint').textContent=t('lookAround')+' ↔';$('about').textContent=t('demo')+' ⓘ';$('about-title').textContent=t('aboutTitle');$('about-body').textContent=t('aboutBody');$('about-limit').textContent=t('aboutLimit');$('close-about').setAttribute('aria-label',t('close'));$('reset-title').textContent=t('resetConfirm');$('reset-cancel').textContent=t('cancel');$('reset-confirm').textContent=t('yesReset');$('fallback').textContent=t('fallback');updateMotion();}
function showChoices(){
 $('choices').replaceChildren();buttons.length=0;
 for(let i=0;i<3;i++){
  const b=document.createElement('button');b.type='button';b.className='choice';b.style.setProperty('--choice-color',colors[i]);
  b.innerHTML=`<span class="choice-dot" aria-hidden="true"></span><span class="choice-copy"><strong>${t('goal'+i)}</strong><small>${t('goalSub'+i)}</small></span><span class="choice-arrow" aria-hidden="true">↗</span><span class="choice-key" aria-hidden="true">0${i+1}</span>`;
  b.addEventListener('click',()=>choose(i));b.addEventListener('pointerenter',()=>scene?.setFocus(i));b.addEventListener('focus',()=>scene?.setFocus(i));b.addEventListener('pointerleave',()=>scene?.setFocus(-1));b.addEventListener('blur',()=>scene?.setFocus(-1));buttons.push(b);$('choices').append(b);
 }
}
function render(){
 const inCare=state.stage==='care';document.body.classList.toggle('in-care',inCare);$('experience').hidden=inCare;$('care').hidden=!inCare;$('experience').dataset.stage=state.stage;$('primary-actions').hidden=state.stage!=='intro';$('back').hidden=state.stage!=='goal';$('choices').hidden=state.stage!=='goal';$('selection-note').hidden=state.stage!=='goal';$('universe-label').hidden=state.stage!=='intro';$('resume').hidden=!caseState;$('enter').hidden=!!caseState;$('skip').hidden=!!caseState;
 if(inCare){setPhase(2);care.show(caseState,storageAvailable);scene?.setStage('finish',0);}else{care.hide();const goal=state.stage==='goal';setPhase(goal?1:0);$('chapter').textContent=t(goal?'goalEyebrow':'introEyebrow');$('headline').innerHTML=t(goal?'goalTitle':'introTitle');$('description').innerHTML=t(goal?'goalDesc':'introDesc');$('note-text').textContent=t('goalNote');if(goal)showChoices();scene?.setStage(state.stage,0);}
}
function transition(message,change,{instant=false}={}){if(busy)return;busy=true;const token=++transitionId;document.body.classList.add('transiting');$('transition-copy').firstElementChild.textContent=message;scene?.burst();const duration=instant||paused||reduced?100:1450;setTimeout(()=>{if(token!==transitionId)return;change();render();window.scrollTo({top:0,behavior:'instant'});setTimeout(()=>{if(token!==transitionId)return;document.body.classList.remove('transiting');busy=false;},100);},duration);}
function enter(instant=false){transition(t('introTransition'),()=>{state.stage='goal';},{instant});}
function openCare(){transition(t('careTransition'),()=>{state.stage='care';});}
function choose(i){if(busy)return;scene?.flyThrough(i);if(!caseState){caseState=createCase(String(i));save();}openCare();}
function resetIntro(){transitionId++;busy=false;document.body.classList.remove('transiting');state.stage='intro';render();window.scrollTo({top:0,behavior:'instant'});}
function updateMotion(){scene?.setPaused(paused);care.setPaused(paused);$('motion').setAttribute('aria-pressed',String(paused));$('motion').setAttribute('aria-label',t(paused?'play':'pause'));$('motion').firstElementChild.textContent=paused?'▷':'Ⅱ';$('reduce-motion').textContent=t(paused?'play':'reduce');}
$('language').addEventListener('change',e=>{setLanguage(e.target.value);localize();render();});
$('enter').addEventListener('click',()=>enter());$('skip').addEventListener('click',()=>enter(true));$('resume').addEventListener('click',openCare);$('back').addEventListener('click',resetIntro);$('restart').addEventListener('click',resetIntro);$('home').addEventListener('click',e=>{e.preventDefault();resetIntro();});
$('motion').addEventListener('click',()=>{paused=!paused;reduced=false;if(scene)scene.reduced=false;updateMotion();});
$('about').addEventListener('click',()=>$('about-dialog').showModal());$('close-about').addEventListener('click',()=>$('about-dialog').close());$('about-dialog').addEventListener('click',e=>{if(e.target===$('about-dialog'))$('about-dialog').close();});
$('reduce-motion').addEventListener('click',()=>{paused=!paused;reduced=paused;if(scene)scene.reduced=reduced;updateMotion();});
$('reset-cancel').addEventListener('click',()=>$('reset-dialog').close());$('reset-confirm').addEventListener('click',()=>{caseState=null;try{localStorage.removeItem(storageKey);}catch{}care.stage=null;care.selected=null;care.draftEdited=false;care.trace=false;$('reset-dialog').close();state.stage='goal';render();window.scrollTo({top:0,behavior:'instant'});});
window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;if(['1','2','3'].includes(e.key)&&state.stage==='goal')choose(Number(e.key)-1);if(e.key==='ArrowLeft'&&state.stage==='goal')resetIntro();});
localize();render();
const projectLabels=points=>{if(innerWidth<600||state.stage!=='goal')return;points.forEach((p,i)=>{const b=buttons[i];if(!b)return;const x=Math.max(innerWidth*.48,Math.min(innerWidth-b.offsetWidth-30,p.x+12));const y=Math.max(155,Math.min(innerHeight-150,p.y));b.style.left=`${Math.round(x)}px`;b.style.top=`${Math.round(y)}px`;});};
async function softwareFallback(){try{scene?.destroy();const{SoftwareUniverse}=await import('./software-scene.js');scene=new SoftwareUniverse($('universe'),{reduced,onProject:projectLabels});scene.setStage(state.stage==='care'?'finish':state.stage,0);scene.setPaused(paused);document.body.classList.remove('no-webgl');$('fallback').hidden=true;}catch(error){console.warn('Lightweight rendering unavailable.',error);document.body.classList.add('no-webgl');$('fallback').hidden=false;}}
try{const{Universe}=await import('./scene.js');scene=new Universe($('universe'),{reduced,onProject:projectLabels});scene.setStage(state.stage==='care'?'finish':state.stage,0);scene.setPaused(paused);scene.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();softwareFallback();});}catch(error){console.warn('Using perspective-rendered 3D fallback.',error);await softwareFallback();}
