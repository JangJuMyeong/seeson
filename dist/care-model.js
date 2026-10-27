export const VERSION=3;
export const PATIENT='demo-patient-seoyeon';
export const CLINICIAN='demo-clinician-kim';
export const STAGES=['W','M1','M3','W2'];
export const GUIDELINE='https://doi.org/10.5646/ch.2026.32.e31';
const initialNodes=[
 {id:'history',kind:'history',occurred_at:'2021-10-27',actor:'record-adapter',data:{source:'synthetic-history'}},
 {id:'genome',kind:'genome',occurred_at:'2026-10-20',actor:'IRS+-demo',data:{source:'synthetic-IRS+',priority:'blood-pressure',model:'illustrative-v1'}},
 {id:'context',kind:'context',occurred_at:'2026-10-26',actor:PATIENT,data:{shift:'evening'}},
 {id:'today',kind:'measurement',occurred_at:'2026-10-27',actor:'wearable-demo',data:{source:'synthetic-wearable'}}
];
export function createCase(goal='1'){
 return {version:VERSION,id:'siseon-trajectory-demo-001',patient:PATIENT,stage:'W',goal,consent:true,nodes:initialNodes.map(n=>({...n,data:{...n.data,...(n.kind==='context'?{goal}:{})},trajectory_id:'siseon-trajectory-demo-001',recorded_at:'2026-10-27T09:00:00+09:00'})),audit:[],sequence:0};
}
export const last=(state,kind)=>state.nodes.findLast(n=>n.kind===kind);
export const currentReview=state=>last(state,'confirmation');
export const diagnosis=state=>currentReview(state)?.data.decision==='confirm'?'hypertension':null;
export const currentIntervention=s=>{const n=last(s,'intervention');return n?.data.review===currentReview(s)?.id?n:undefined;};
export const currentResponse=s=>{const p=currentIntervention(s);return p?s.nodes.findLast(n=>n.kind==='response'&&n.data.intervention===p.id):undefined;};
export const currentOutcome=s=>{const r=currentResponse(s);return r?s.nodes.findLast(n=>n.kind==='outcome'&&n.evidence_refs.includes(r.id)):undefined;};
export function canVisit(s,stage){if(!STAGES.includes(stage))return false;if(stage==='W')return true;if(stage==='M1')return !!last(s,'question');if(stage==='M3')return !!currentReview(s);return !!currentResponse(s);}
function requireRole(event,role){if(event.role!==role)throw new Error('ROLE_REQUIRED');}
function required(value,error){if(!value)throw new Error(error);}
function append(s,kind,data,actor,date,refs=[]){const id=`${kind}-${++s.sequence}`;const node={id,kind,trajectory_id:s.id,occurred_at:date,recorded_at:new Date().toISOString(),actor,evidence_refs:refs,data};s.nodes.push(node);s.audit.push({id:`log-${s.sequence}`,node_id:id,actor,action:kind,at:node.recorded_at});return node;}
export function applyEvent(state,event){
 const s=JSON.parse(JSON.stringify(state));
 if(event.type==='QUESTION'){
  requireRole(event,'patient');required(event.text?.trim(),'QUESTION_REQUIRED');
  if(last(s,'question'))return s;
  append(s,'question',{text:event.text.trim().slice(0,600),language:event.language||'ko'},PATIENT,'2026-10-27',['context','genome','today']);
 }else if(event.type==='VISIT'){
  required(canVisit(s,event.stage),'STAGE_LOCKED');s.stage=event.stage;
  if(event.stage==='M3'&&!last(s,'discharge'))append(s,'discharge',{source:'synthetic-M2-discharge',handoff:true,scope:'measurement-check-in'},CLINICIAN,'2026-11-02',[currentReview(s).id]);
 }else if(event.type==='REVIEW'){
  requireRole(event,'clinician');required(s.stage==='M1','STAGE_REQUIRED');required(last(s,'question'),'QUESTION_REQUIRED');
  required(['confirm','defer'].includes(event.decision),'DECISION_REQUIRED');required(['evening','flexible'].includes(event.plan),'PLAN_REQUIRED');
  const previous=currentReview(s);
  if(previous&&previous.data.decision===event.decision&&previous.data.plan===event.plan)return s;
  append(s,'confirmation',{decision:event.decision,plan:event.plan,clinician:CLINICIAN,scope:['measurement-check-in',...(event.decision==='confirm'?['diagnosis-relay']:[])],supersedes:previous?.id||null,source:'synthetic-clinician-review'},CLINICIAN,'2026-10-29',[last(s,'question').id,'history','today','genome']);
 }else if(event.type==='ADVANCE'){
  requireRole(event,'clinician');required(s.stage==='M3','STAGE_REQUIRED');required(last(s,'discharge'),'DISCHARGE_REQUIRED');
  if(last(s,'signal'))return s;
  append(s,'signal',{missingDays:3,alternatives:['device','schedule','choice'],source:'synthetic-measurement-gap'},'demo-rule-engine','2026-11-05',['today',last(s,'discharge').id]);
 }else if(event.type==='APPROVE'){
  requireRole(event,'clinician');required(s.stage==='M3','STAGE_REQUIRED');required(s.consent,'CONSENT_REQUIRED');
  const review=currentReview(s),signal=last(s,'signal'),handoff=last(s,'discharge');
  required(review?.data.scope.includes('measurement-check-in'),'CONFIRMATION_REQUIRED');required(signal&&handoff,'EVIDENCE_REQUIRED');
  required(event.clinician===CLINICIAN,'CLINICIAN_REQUIRED');required(event.evidenceReviewed===true,'REVIEW_REQUIRED');
  if(last(s,'intervention')?.data.review===review.id)return s;
  append(s,'intervention',{clinician:event.clinician,review:review.id,plan:review.data.plan,scope:'measurement-check-in',delivery:'in-demo-only',policyVersion:'checkin-demo-v1'},CLINICIAN,'2026-11-05',[review.id,signal.id,handoff.id]);
 }else if(event.type==='RESPOND'){
  requireRole(event,'patient');required(s.stage==='M3','STAGE_REQUIRED');const proposal=last(s,'intervention');
  required(proposal,'APPROVAL_REQUIRED');required(proposal.data.review===currentReview(s)?.id,'APPROVAL_STALE');
  required(['yes','no'].includes(event.answer),'ANSWER_REQUIRED');if(currentResponse(s))return s;
  append(s,'response',{answer:event.answer,reason:event.answer==='no'?'timing':'accepted',intervention:proposal.id},PATIENT,'2026-11-05',[proposal.id]);
  if(event.answer==='no')append(s,'learning_proposal',{status:'pending-clinician-review',proposal:'review-checkin-timing',autoApplied:false},'demo-review-engine','2026-11-05',[currentResponse(s).id]);
 }else if(event.type==='OBSERVE'){
  requireRole(event,'patient');required(s.stage==='M3','STAGE_REQUIRED');required(currentResponse(s)?.data.answer==='yes','ACCEPTANCE_REQUIRED');
  required(last(s,'intervention')?.data.review===currentReview(s)?.id,'APPROVAL_STALE');if(currentOutcome(s))return s;
  append(s,'outcome',{measurementResumed:true,clinicalImprovement:null,source:'synthetic-followup-record',uncertainty:'illustrative-observation-gap-reduced'},'wearable-demo','2026-11-06',[currentResponse(s).id]);
 }else throw new Error('UNKNOWN_EVENT');
 return s;
}
export function restoreCase(raw){try{const s=JSON.parse(raw);if(s.version!==VERSION||s.id!=='siseon-trajectory-demo-001'||!Array.isArray(s.nodes)||!Array.isArray(s.audit)||!Number.isInteger(s.sequence)||s.sequence<0||s.sequence>300||s.nodes.length>300||!STAGES.includes(s.stage))return null;for(const n of s.nodes)if(n.trajectory_id!==s.id||typeof n.id!=='string'||!n.kind||!n.data||typeof n.data!=='object')return null;if(!canVisit(s,s.stage))return null;return s;}catch{return null;}}
