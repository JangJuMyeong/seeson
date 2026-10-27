import {currentOutcome} from './care-model.js';
export class TrajectoryView {
 constructor(host){
  this.host=host;this.canvas=document.createElement('canvas');this.canvas.setAttribute('aria-hidden','true');host.prepend(this.canvas);this.ctx=this.canvas.getContext('2d');this.time=0;this.paused=false;this.active=true;this.pointer={x:0,y:0};this.nodes=[];
  this.move=e=>{const r=host.getBoundingClientRect();this.pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};};
  this.leave=()=>{this.pointer={x:0,y:0};};host.addEventListener('pointermove',this.move);host.addEventListener('pointerleave',this.leave);
  this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(host);this.tick=this.tick.bind(this);this.frame=requestAnimationFrame(this.tick);
 }
 update(state,selected,onSelect){this.state=state;this.selected=selected;this.onSelect=onSelect;this.nodes=state.nodes;this.draw();}
 setPaused(v){this.paused=v;this.draw();}
 setActive(v){this.active=v;}
 project(x,y,z){const depth=1/(1+z*.001);return{x:this.w*.5+(x-this.w*.5+this.pointer.x*z*.1)*depth,y:this.h*.5+(y-this.h*.5+this.pointer.y*z*.12)*depth};}
 point(u,offset=0){const x=this.w*(.065+.87*u);const y=this.h*(.54-.1*Math.sin(u*5.8)+.035*Math.sin(u*12))+offset;const z=Math.sin(u*6.1)*85;return this.project(x,y,z);}
 path(start,end,offset=0){const c=this.ctx;c.beginPath();for(let i=0;i<=90;i++){const p=this.point(start+(end-start)*i/90,typeof offset==='function'?offset(i/90):offset);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}}
 draw(){
  if(!this.state||!this.host.clientWidth)return;const d=Math.min(devicePixelRatio||1,2);this.w=this.host.clientWidth;this.h=this.host.clientHeight;const c=this.ctx;if(this.canvas.width!==Math.round(this.w*d)||this.canvas.height!==Math.round(this.h*d)){this.canvas.width=this.w*d;this.canvas.height=this.h*d;}c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,this.w,this.h);
  const glow=c.createRadialGradient(this.w*.57,this.h*.5,0,this.w*.57,this.h*.5,this.w*.55);glow.addColorStop(0,'#96e9dc0c');glow.addColorStop(1,'#96e9dc00');c.fillStyle=glow;c.fillRect(0,0,this.w,this.h);
  for(let i=0;i<95;i++){const x=(Math.sin(i*17.1)*.5+.5)*this.w,y=(Math.sin(i*8.7+2)*.5+.5)*this.h;c.fillStyle=`rgba(167,218,229,${.08+(i%5)*.025})`;c.beginPath();c.arc(x,y,.6+(i%3)*.25,0,Math.PI*2);c.fill();}
  // Two spatial reference planes remain visible, without numerical scores.
  c.setLineDash([3,7]);for(const [off,col]of [[-75,'#cfa5b94a'],[48,'#b1d7cf48']]){this.path(0,1,off);c.strokeStyle=col;c.lineWidth=1;c.stroke();}c.setLineDash([]);
  // IRS+ is an illustrative foundation, carried through every care stage.
  for(let i=0;i<7;i++){this.path(0,1,(u)=>50+i*5+Math.sin(u*5+i*.25)*7);c.strokeStyle=`rgba(136,162,199,${.05+i*.009})`;c.lineWidth=1;c.stroke();}
  const observed=!!currentOutcome(this.state);const spread=observed?32:67;const join=.61;
  for(let i=0;i<32;i++){const offset=(i/31-.5)*2;this.path(join,1,u=>offset*(5+u*spread));c.strokeStyle=`rgba(${observed?'166,242,215':'147,173,210'},${.045+.045*(1-Math.abs(offset))})`;c.lineWidth=2;c.stroke();}
  const grad=c.createLinearGradient(0,0,this.w,0);grad.addColorStop(0,'#648d9c');grad.addColorStop(.4,'#b5f3dc');grad.addColorStop(.65,'#d6ffe9');grad.addColorStop(1,'#a1c3ef');this.path(0,1);c.strokeStyle=grad;c.shadowColor='#b2f5e4';c.shadowBlur=18;c.lineWidth=2.1;c.stroke();c.shadowBlur=0;
  if(!this.paused){const p=this.point((this.time*.055)%1);c.fillStyle='#d7fff4';c.shadowColor='#c4ffeb';c.shadowBlur=17;c.beginPath();c.arc(p.x,p.y,2.4,0,Math.PI*2);c.fill();c.shadowBlur=0;}
  const today=this.point(join);c.setLineDash([2,5]);c.strokeStyle='#b2f5e429';c.beginPath();c.moveTo(today.x,48);c.lineTo(today.x,this.h-36);c.stroke();c.setLineDash([]);
  this.positions=this.nodes.map((n,i)=>({...this.point(.04+i/Math.max(1,this.nodes.length-1)*.55),node:n}));
  this.positions.forEach(p=>{const sel=p.node.id===this.selected;const special=p.node.kind==='confirmation';c.strokeStyle=special?'#d8f5c2':'#b4f4e1';c.fillStyle=sel?'#dbfff0':'#10221f';c.lineWidth=sel?2:1;c.beginPath();c.arc(p.x,p.y,sel?7:special?6:4,0,Math.PI*2);c.fill();c.stroke();if(sel){c.beginPath();c.arc(p.x,p.y,15,0,Math.PI*2);c.strokeStyle='#c5ffe333';c.stroke();}});
  this.host.querySelectorAll('[data-plot-node]').forEach((button,i)=>{const p=this.positions[i];if(p){button.style.left=`${p.x}px`;button.style.top=`${p.y}px`;}});
 }
 tick(ts){if(this.active&&(!this.lastFrame||ts-this.lastFrame>40)){if(!this.paused)this.time+=.04;this.draw();this.lastFrame=ts;}this.frame=requestAnimationFrame(this.tick);}
 destroy(){cancelAnimationFrame(this.frame);this.resize.disconnect();this.host.removeEventListener('pointermove',this.move);this.host.removeEventListener('pointerleave',this.leave);}
}
