// Perspective-projected 3D fallback: the same spatial experience without a WebGL context.
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const normalize=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
let seed=1027;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const palette=['#b9f8dc','#91bbf7','#b8a0c3'];
export class SoftwareUniverse{
 constructor(container,{reduced=false,onProject=()=>{}}={}){
  this.container=container;this.canvas=document.createElement('canvas');this.ctx=this.canvas.getContext('2d',{alpha:false});if(!this.ctx)throw new Error('Canvas rendering unavailable');
  container.replaceChildren(this.canvas);this.onProject=onProject;this.reduced=reduced;this.paused=reduced;this.stage='intro';this.time=0;this.last=performance.now();this.introAt=0;this.pointer=[0,0];this.drag=[0,0];this.camera=[0,5,66];this.target=[0,5,66];this.look=[1,0,0];this.targetLook=[1,0,0];this.boost=0;this.flight=null;this.focus=-1;
  this.curves=[];this.stars=[];this.streaks=[];
  const count=innerWidth<600?650:1100;
  for(let i=0;i<count;i++){
   const r=4+Math.pow(random(),.68)*29,phase=random()*TAU,span=.6+random()*2.4,arm=i%4,base=arm*TAU/4+r*.108+phase*.13,y=(random()-.5)*2.5*(.3+r/22),pts=[];
   for(let j=0;j<=24;j++){const t=j/24,a=base+span*t,rr=r*(.84+.16*t);pts.push([Math.cos(a)*rr,y+Math.sin(a*2+phase)*(.15+r*.013),Math.sin(a)*rr*.78]);}
   this.curves.push({pts,color:i%5,bright:i%9===0});
  }
  for(let i=0;i<5000;i++){const r=Math.pow(random(),.6)*38,a=i%4*TAU/4+r*.12+(random()-.5)*.7;this.stars.push({p:[Math.cos(a)*r,(random()-.5)*1.5*(.4+r*.13),Math.sin(a)*r*.78],s:random()<.03?1.4:.4+random()*.6,alpha:.2+random()*.65});}
  for(let i=0;i<12000;i++){const a=random()*TAU,r=5+random()*105;this.streaks.push([Math.cos(a)*r,Math.sin(a)*r*.75,random()*220]);}
  this.resize=()=>{this.w=innerWidth;this.h=innerHeight;this.canvas.width=this.w;this.canvas.height=this.h;this.f=this.h/(2*Math.tan(48*Math.PI/360));};
  this.pointerMove=e=>{this.pointer=[(e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2];};
  window.addEventListener('resize',this.resize);window.addEventListener('pointermove',this.pointerMove);this.resize();this.setStage('intro');this.animate();
 }
 setStage(stage,step=0){this.stage=stage;this.step=step;this.focus=-1;this.flight=null;if(stage==='intro'){this.target=[0,5,66];this.targetLook=[1,0,0];this.introAt=this.time;}else if(stage==='finish'){this.target=[-7,12,66];this.targetLook=[8,0,0];}else{this.target=[0,1,47];this.targetLook=[0,0,0];}this.endpoints=[[10,8,0],[15,-.4,-5],[10,-9,1]];}
 setFocus(i){this.focus=i;}
 setPaused(value){this.paused=value;this.boost=0;}
 burst(){if(!this.paused&&!this.reduced)this.boost=1;}
 flyThrough(i){if(this.paused||this.reduced)return;this.focus=i;this.flight={start:[...this.camera],look:[...this.look],target:[this.endpoints[i][0]-1,this.endpoints[i][1]+2,this.endpoints[i][2]+12],end:this.endpoints[i],age:0};this.ripple={point:this.endpoints[i],age:0,color:palette[i]};}
 basis(){this.forward=normalize(this.look.map((v,i)=>v-this.camera[i]));this.right=normalize(cross(this.forward,[0,1,0]));this.up=cross(this.right,this.forward);}
 project(p){const r=[p[0]-this.camera[0],p[1]-this.camera[1],p[2]-this.camera[2]],depth=dot(r,this.forward);if(depth<.5)return null;return {x:this.w*.5+dot(r,this.right)*this.f/depth,y:this.h*.5-dot(r,this.up)*this.f/depth,z:depth};}
 world(p){const a=this.time*.015,ca=Math.cos(a),sa=Math.sin(a),x=p[0]*ca+p[2]*sa,z=-p[0]*sa+p[2]*ca,tilt=.62+this.pointer[1]*.025,ct=Math.cos(tilt),st=Math.sin(tilt),y=p[1]*ct-z*st,zz=p[1]*st+z*ct,roll=-.29,cr=Math.cos(roll),sr=Math.sin(roll);return [x*cr-y*sr+18,x*sr+y*cr-1,zz-7];}
 route(i,t){const start=[-2,-3,17],end=this.endpoints[i],bend=this.step%2?2:-2,c1=[3+bend,-2,9],c2=[end[0]-2,end[1]*.72,3],u=1-t;return start.map((x,j)=>u*u*u*x+3*u*u*t*c1[j]+3*u*t*t*c2[j]+t*t*t*end[j]);}
 animate(){
  this.raf=requestAnimationFrame(()=>this.animate());const now=performance.now();if(now-this.last<1000/30)return;const dt=Math.min((now-this.last)/1000,.1);this.last=now;if(document.hidden)return;
  const active=!this.paused&&!this.reduced;if(active)this.time+=dt;
  const c=this.ctx;c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#05070e';c.fillRect(0,0,this.w,this.h);
  this.boost=Math.max(0,this.boost-dt*.63);const speed=active?Math.max(this.boost,this.stage==='intro'?Math.max(0,1-(this.time-this.introAt)/4):0):0;
  if(this.flight&&active){this.flight.age+=dt;const t=Math.min(1,this.flight.age/1.35),e=t*t*(3-2*t);this.camera=this.flight.start.map((v,i)=>mix(v,this.flight.target[i],e));this.look=this.flight.look.map((v,i)=>mix(v,this.flight.end[i],e));}else{this.camera=this.camera.map((v,i)=>mix(v,this.target[i],active?.1:1));this.look=this.look.map((v,i)=>mix(v,this.targetLook[i],active?.1:1));}
  const stored=[...this.camera];if(active){this.camera[0]+=this.pointer[0]*1.3;this.camera[1]-=this.pointer[1]*.7;this.camera[2]-=speed*9;}this.basis();
  const opacity=this.stage==='intro'?.7:this.stage==='finish'?.38:.2;
  const core=this.project([18,-1,-7]);if(core){const radius=150*this.h/700,g=c.createRadialGradient(core.x,core.y,0,core.x,core.y,radius);g.addColorStop(0,`rgba(102,174,176,${opacity*.35})`);g.addColorStop(.22,`rgba(55,125,145,${opacity*.16})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(core.x-radius,core.y-radius,radius*2,radius*2);}
  c.globalCompositeOperation='lighter';const colors=['#77a7b1','#7195b1','#9ac7c7','#8a8eaf','#b1d1cb'];
  for(let k=0;k<5;k++){
   c.beginPath();for(const curve of this.curves){if(curve.color!==k)continue;let first=true;for(const p of curve.pts){const q=this.project(this.world(p));if(!q){first=true;continue;}if(first){c.moveTo(q.x,q.y);first=false;}else c.lineTo(q.x,q.y);}}
   c.strokeStyle=colors[k];c.globalAlpha=opacity*.42;c.lineWidth=.52;c.stroke();
  }
  c.fillStyle='#b4d5dd';for(const star of this.stars){const p=this.project(this.world(star.p));if(!p||p.x<0||p.x>this.w||p.y<0||p.y>this.h)continue;c.globalAlpha=star.alpha*(opacity+.15);const s=clamp(star.s*65/p.z,.5,2.7);c.fillRect(p.x,p.y,s,s);}
  if(speed>.002){c.beginPath();for(const p of this.streaks){const z=((p[2]+this.time*100+this.boost*60)%220)-170;const q=this.project([p[0],p[1],z]),end=this.project([p[0],p[1],z-1-speed*15]);if(q&&end){c.moveTo(q.x,q.y);c.lineTo(end.x,end.y);}}c.globalAlpha=speed*.27;c.strokeStyle='#91c6d8';c.lineWidth=.65;c.stroke();}
  if(this.stage==='goal'||this.stage==='choice'){
   for(let i=0;i<3;i++){
    const gain=this.focus<0||this.focus===i?1:.28;
    c.beginPath();for(let j=0;j<=65;j++){const p=this.project(this.route(i,j/65));if(!p)continue;if(j===0)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);}
    c.strokeStyle=palette[i];for(const [width,alpha] of [[7,.025],[3,.08],[.85,.85]]){c.lineWidth=width;c.globalAlpha=alpha*gain;c.stroke();}
    const end=this.project(this.endpoints[i]);if(end){c.globalAlpha=.9*gain;c.fillStyle=palette[i];c.beginPath();c.arc(end.x,end.y,this.focus===i?4.8:3.5,0,TAU);c.fill();}
    const pulse=this.project(this.route(i,(this.time*.12+i*.31)%1));if(pulse){c.fillStyle='#e5fff7';c.globalAlpha=.9*gain;c.beginPath();c.arc(pulse.x,pulse.y,1.6,0,TAU);c.fill();}
   }
   this.onProject(this.endpoints.map(p=>this.project(p)||{x:this.w*.6,y:this.h*.5}));
  }
  if(this.ripple){this.ripple.age+=dt;const p=this.project(this.ripple.point);if(p&&this.ripple.age<1.5){c.globalAlpha=Math.max(0,.4-this.ripple.age*.27);c.strokeStyle=this.ripple.color;c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y,10+this.ripple.age*150,8+this.ripple.age*90,-.3,0,TAU);c.stroke();}}
  this.camera=stored;c.globalAlpha=1;c.globalCompositeOperation='source-over';
 }
 destroy(){cancelAnimationFrame(this.raf);window.removeEventListener('resize',this.resize);window.removeEventListener('pointermove',this.pointerMove);this.canvas.remove();}
}
