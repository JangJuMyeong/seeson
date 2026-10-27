const $=id=>document.getElementById(id);
const colors=['#b9f8dc','#91bbf7','#b8a0c3'];
const goals=[
 {title:'여유로운 아침',sub:'내 일상에 숨 쉴 틈을',line:'조금 더 여유로운 내일로',reason:'나에게 여백이 있는 하루'},
 {title:'오래 이어갈 일상',sub:'소중한 시간을 더 길게',line:'오래 이어질 나의 일상으로',reason:'꾸준히 이어갈 수 있는 일상'},
 {title:'나답게 보내는 시간',sub:'나의 속도와 방식으로',line:'나의 속도로, 나다운 내일로',reason:'내 상황과 속도에 맞는 변화'}
];
const steps=[
 {chapter:'THE FIRST TURN',title:'작은 선택이,<br>새로운 방향이 됩니다.',desc:'지금 나에게 가능한 한 걸음.<br>그 선택에서 다음 길이 시작됩니다.',options:[
 {title:'하루에 작은 여백 만들기',sub:'목표에 가까운 방향',reason:'바꾸고 싶은 일상에 작은 공간을 만드는 선택입니다.'},
 {title:'지금의 리듬 이어가기',sub:'현재의 흐름',reason:'현재의 리듬을 먼저 관찰하며 다음 선택을 기다립니다.'},
 {title:'내 상황부터 이야기하기',sub:'맥락을 더 알아가는 방향',reason:'무엇이 가능한지 나의 상황과 선호부터 이해합니다.'}]},
 {chapter:'A LINE, UNDERSTOOD',title:'내 이야기를 알수록,<br>길은 선명해집니다.',desc:'기록 뒤에 있는 사정과 마음까지.<br>다음 선택에 함께 이어집니다.',options:[
 {title:'내 목표를 의료진과 나누기',sub:'함께 확인하는 방향',reason:'나의 목표와 의료진의 판단이 같은 선 위에서 만납니다.'},
 {title:'일상의 맥락 더 남기기',sub:'나를 더 이해하는 방향',reason:'기록에 없던 상황을 남겨 성급한 해석을 줄입니다.'},
 {title:'조금 더 생각할 시간 갖기',sub:'나의 속도를 지키는 방향',reason:'결정을 서두르지 않는 선택도 다음 판단의 맥락이 됩니다.'}]},
 {chapter:'BEYOND THIS MOMENT',title:'오늘의 선택은,<br>내일에도 남습니다.',desc:'좋았던 선택도, 달라진 생각도.<br>다음의 나를 이해하는 단서가 됩니다.',options:[
 {title:'나에게 맞는 때 다시 돌아오기',sub:'선택을 이어가는 방향',reason:'다음에 돌아올 때도 이전의 목표와 선택을 함께 봅니다.'},
 {title:'내가 고른 길 되돌아보기',sub:'이유를 확인하는 방향',reason:'왜 이 길을 골랐는지 돌아보며 다음 방향을 생각합니다.'},
 {title:'새로운 가능성 열어두기',sub:'방향을 바꿀 수 있는 여지',reason:'목표가 달라지면 길도 바뀔 수 있도록 가능성을 남깁니다.'}]}
];
function currentStep(){
 const s=steps[state.step];
 if(state.step!==0||state.goal===0)return s;
 const primary=state.goal===1?{title:'꾸준히 할 작은 일 정하기',sub:'목표에 가까운 방향',reason:'오래 이어갈 일상을 위해 부담 없이 반복할 수 있는 일을 고릅니다.'}:{title:'내 방식에 맞춰 작게 시작하기',sub:'목표에 가까운 방향',reason:'나답게 보내는 시간을 위해 내가 정한 방식과 속도로 시작합니다.'};
 return {...s,options:[primary,...s.options.slice(1)]};
}
let state={stage:'intro',goal:null,step:0,history:[],question:false,questions:[]};
let scene=null,busy=false,transitionId=0;let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let paused=reduced;
const buttons=[];
function setCopy(chapter,title,desc){$('chapter').textContent=chapter;$('headline').innerHTML=title;$('description').innerHTML=desc;}
function setPhase(phase){document.querySelectorAll('[data-phase]').forEach(el=>el.classList.toggle('active',Number(el.dataset.phase)===phase));}
function note(text){$('selection-note').hidden=!text;$('note-text').textContent=text||'';}
function showChoices(options){
 $('choices').replaceChildren();buttons.length=0;
 options.forEach((option,i)=>{
  const b=document.createElement('button');b.type='button';b.className='choice';b.style.setProperty('--choice-color',colors[i]);
  const dot=document.createElement('span');dot.className='choice-dot';dot.setAttribute('aria-hidden','true');
  const copy=document.createElement('span');copy.className='choice-copy';const title=document.createElement('strong');title.textContent=option.title;
  const sub=document.createElement('small');sub.textContent=option.sub;copy.append(title,sub);
  const arrow=document.createElement('span');arrow.className='choice-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
  const key=document.createElement('span');key.className='choice-key';key.textContent=`0${i+1}`;key.setAttribute('aria-hidden','true');
  b.append(dot,copy,arrow,key);b.addEventListener('click',()=>choose(i));
  b.addEventListener('pointerenter',()=>focusChoice(i,option));b.addEventListener('focus',()=>focusChoice(i,option));
  b.addEventListener('pointerleave',clearFocus);b.addEventListener('blur',clearFocus);
  buttons.push(b);$('choices').append(b);
 });
 $('choices').hidden=false;
}
function focusChoice(i,option){scene?.setFocus(i);if(state.stage==='choice')note(option.reason);}
function clearFocus(){scene?.setFocus(-1);if(state.stage==='choice')note(`지금의 목표 · ${goals[state.goal].reason}`);}
function render(){
 $('experience').dataset.stage=state.stage;$('choices').hidden=true;$('journey').hidden=true;$('primary-actions').hidden=state.stage!=='intro';$('back').hidden=state.stage==='intro';$('universe-label').hidden=state.stage!=='intro';
 if(state.stage==='intro'){
  setCopy('A LIFE, CONNECTED','수많은 가능성.<br><span class="soft">나에게 이어지는</span><br>하나의 선.','흩어진 시간과 선택이 하나로 이어질 때,<br>나의 내일은 새로운 방향을 갖습니다.');setPhase(0);note('');
 }else if(state.stage==='goal'){
  setCopy('FIND YOUR OWN LINE','어떤 내일이,<br>나에게 가까울까요?','수많은 선 가운데, 지금 마음이 향하는 곳.<br>그곳에서 나의 이야기를 시작합니다.');setPhase(1);showChoices(goals);note('지금 마음이 향하는 선을 선택해 보세요. 언제든 다른 길로 바꿀 수 있어요.');
 }else if(state.stage==='choice'){
  const s=currentStep();setCopy(s.chapter,s.title,s.desc);setPhase(1);showChoices(s.options);note(`지금의 목표 · ${goals[state.goal].reason}`);
 }else{
  setCopy('YOUR LIFE, CONTINUED','삶의 선을 잇고,<br><span class="soft">더 나은 내일을</span><br>보다.','선택은 사라지지 않습니다.<br>다음의 나를 이해하는 맥락이 됩니다.');setPhase(2);note('');$('journey').hidden=false;
  const list=$('history');list.replaceChildren();const start=Math.max(0,state.history.length-4);state.history.slice(start).forEach((entry,k)=>{const i=start+k;const li=document.createElement('li');li.textContent=entry.title;const small=document.createElement('small');small.textContent=i===0?'나의 목표':`이어진 선택 ${i}`;li.append(small);list.append(li);});
  $('journey').querySelector('.journey-header span').textContent=start>0?`앞선 ${start}개의 기록과 연결`:'선택은 이어집니다';
  $('save-question').hidden=state.question;$('saved-question').hidden=!state.questions.length;
  if(state.questions.length)$('saved-question').textContent=state.questions[state.questions.length-1]+(state.questions.length>1?` · 이어진 질문 ${state.questions.length}개`:'');
 }
 scene?.setStage(state.stage,state.step);
}
function transition(message,change,{instant=false}={}){
 if(busy)return;busy=true;const token=++transitionId;
 document.body.classList.add('transiting');$('transition-copy').firstElementChild.textContent=message;scene?.burst();
 const duration=instant||paused||reduced?100:1450;
 setTimeout(()=>{if(token!==transitionId)return;change();render();setTimeout(()=>{if(token!==transitionId)return;document.body.classList.remove('transiting');busy=false;},100);},duration);
}
function enter(instant=false){transition('수많은 연결 속에서, 나에게로.',()=>{state={stage:'goal',goal:null,step:0,history:[],question:false,questions:[]};},{instant});}
function choose(i){
 if(busy)return;
 scene?.flyThrough(i);
 if(state.stage==='goal'){
  const g=goals[i];transition(g.line,()=>{state.goal=i;state.history=[{title:g.title,index:i,type:'goal'}];state.stage='choice';state.step=0;});
 }else if(state.stage==='choice'){
  const option=currentStep().options[i];transition(['선택이, 새로운 길이 됩니다.','이해가, 방향을 만듭니다.','당신의 시간은 계속 이어집니다.'][state.step],()=>{state.history.push({title:option.title,index:i,type:'choice',step:state.step});state.step++;state.stage=state.step>=steps.length?'finish':'choice';state.question=false;});
 }
}
function back(){if(busy)return;if(state.stage==='goal'){reset();return;}transition('앞선 선택을 다시 바라봅니다.',()=>{if(state.stage==='finish'){state.stage='choice';state.step=steps.length-1;state.history.pop();}else if(state.step===0&&state.history.length>1){state.step=steps.length-1;state.history.pop();}else if(state.step===0){state.stage='goal';state.goal=null;state.history=[];}else{state.step--;state.history.pop();}state.question=false;},{instant:true});}
function reset(){transitionId++;busy=false;document.body.classList.remove('transiting');state={stage:'intro',goal:null,step:0,history:[],question:false,questions:[]};render();window.scrollTo({top:0,behavior:'instant'});}
function updateMotion(){scene?.setPaused(paused);$('motion').setAttribute('aria-pressed',String(paused));$('motion').setAttribute('aria-label',paused?'움직임 재생하기':'움직임 멈추기');$('motion').firstElementChild.textContent=paused?'▷':'Ⅱ';$('reduce-motion').textContent=paused?'움직임 다시 재생':'움직임 줄이기';}
$('enter').addEventListener('click',()=>enter());$('skip').addEventListener('click',()=>enter(true));$('back').addEventListener('click',back);$('restart').addEventListener('click',reset);$('home').addEventListener('click',e=>{e.preventDefault();reset();});
$('motion').addEventListener('click',()=>{paused=!paused;reduced=false;if(scene)scene.reduced=false;updateMotion();});
$('about').addEventListener('click',()=>$('about-dialog').showModal());$('close-about').addEventListener('click',()=>$('about-dialog').close());
$('about-dialog').addEventListener('click',e=>{if(e.target===$('about-dialog')){$('about-dialog').close();}});
$('reduce-motion').addEventListener('click',()=>{paused=!paused;reduced=paused;if(scene)scene.reduced=reduced;updateMotion();});
$('save-question').addEventListener('click',()=>{state.question=true;state.questions.push(`“${goals[state.goal].title}을 위해, 제 상황에 맞는 다음 한 걸음을 함께 정하고 싶어요.” · 내 선에 남긴 질문`);render();});
$('continue').addEventListener('click',()=>transition('앞선 선택을 이어, 또 하나의 가능성.',()=>{state.stage='choice';state.step=0;state.question=false;}));
window.addEventListener('keydown',e=>{if($('about-dialog').open||e.altKey||e.ctrlKey||e.metaKey)return;if(['1','2','3'].includes(e.key)&&['goal','choice'].includes(state.stage))choose(Number(e.key)-1);if(e.key==='ArrowLeft'&&state.stage!=='intro')back();});
render();updateMotion();
const projectLabels=points=>{if(innerWidth<600)return;points.forEach((p,i)=>{const b=buttons[i];if(!b)return;const x=Math.max(innerWidth*.48,Math.min(innerWidth-b.offsetWidth-30,p.x+12));const y=Math.max(155,Math.min(innerHeight-150,p.y));b.style.left=`${Math.round(x)}px`;b.style.top=`${Math.round(y)}px`;});};
async function softwareFallback(){
 try{scene?.destroy();const {SoftwareUniverse}=await import('./software-scene.js');scene=new SoftwareUniverse($('universe'),{reduced,onProject:projectLabels});scene.setStage(state.stage,state.step);scene.setPaused(paused);document.body.classList.remove('no-webgl');$('fallback').hidden=true;}
 catch(error){console.warn('Lightweight rendering unavailable.',error);document.body.classList.add('no-webgl');$('fallback').hidden=false;}
}
try{
 const {Universe}=await import('./scene.js');
 scene=new Universe($('universe'),{reduced,onProject:projectLabels});
 scene.setStage(state.stage,state.step);scene.setPaused(paused);
 scene.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();softwareFallback();});
}catch(error){console.warn('Using perspective-rendered 3D fallback.',error);await softwareFallback();}
