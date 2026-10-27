import * as THREE from './vendor/three.module.min.js';

const TAU=Math.PI*2;
const lerp=THREE.MathUtils.lerp;
const palette=[new THREE.Color('#b9f8dc'),new THREE.Color('#91bbf7'),new THREE.Color('#b8a0c3')];
let seed=1027;
function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}

export class Universe {
 constructor(container,{reduced=false,onProject=()=>{},lowPower=false}={}){
  this.container=container;this.reduced=reduced;this.paused=reduced;this.onProject=onProject;
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,900);
  this.lowPower=lowPower||innerWidth<600;
  this.renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'default'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.lowPower?1:1.25));this.renderer.setSize(innerWidth,innerHeight);
  this.renderer.setClearColor(0x05070e,1);this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  container.appendChild(this.renderer.domElement);
  this.pointer=new THREE.Vector2();this.drag=new THREE.Vector2();this.cam=new THREE.Vector3(0,5,66);this.camera.position.copy(this.cam);
  this.look=new THREE.Vector3(1,0,0);this.targetLook=this.look.clone();this.targetCamera=this.cam.clone();
  this.stage='intro';this.elapsed=0;this.last=performance.now();this.speed=1;this.boost=0;this.galaxyOpacity=.9;this.routeOpacity=0;this.branchObjects=[];this.branchPaths=[];this.focus=-1;
  this.root=new THREE.Group();this.root.position.set(18,-1,-7);this.root.rotation.set(.62,.15,-.29);this.scene.add(this.root);
  this.createGalaxy();this.createStars();this.createWarp();this.createCore();this.routes=new THREE.Group();this.scene.add(this.routes);
  this.listeners=[];
  const listen=(t,n,f,o)=>{t.addEventListener(n,f,o);this.listeners.push(()=>t.removeEventListener(n,f,o));};
  listen(window,'resize',()=>this.resize());
  listen(window,'pointermove',e=>{this.pointer.set((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2);});
  let dragging=false,lastX=0,lastY=0;
  listen(container,'pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;});
  listen(window,'pointerup',()=>{dragging=false;});
  listen(window,'pointermove',e=>{if(dragging){this.drag.x+=(e.clientX-lastX)*.003;this.drag.y+=(e.clientY-lastY)*.002;lastX=e.clientX;lastY=e.clientY;}});
  listen(document,'visibilitychange',()=>{this.last=performance.now();});
  this.resize();this.animate();
 }
 createGalaxy(){
  const positions=[],colors=[],ids=[];const curves=this.lowPower?600:1000,segments=32;
  const p=new THREE.Vector3();
  for(let i=0;i<curves;i++){
   const radius=3.5+Math.pow(random(),.68)*29,phase=random()*TAU,span=.5+random()*2.65;
   const arm=i%4,base=arm*Math.PI/2+radius*.108+phase*.13;
   const y=(random()-.5)*2.6*(.25+radius/22);const tilt=(random()-.5)*.1;
   const c=new THREE.Color().setHSL(.47+random()*.18,.28+random()*.35,.2+random()*.37);
   if(i%13===0)c.copy(palette[2]);if(i%29===0)c.set('#d7efe2');
   const point=t=>{const angle=base+span*t;const rr=radius*(.84+.16*t);return p.set(Math.cos(angle)*rr,y+Math.sin(angle*2+phase)*(.15+radius*.013)+tilt*t*radius,Math.sin(angle)*rr*.78);};
   for(let j=0;j<segments;j++)for(const t of [j/segments,(j+1)/segments]){
    point(t);positions.push(p.x,p.y,p.z);colors.push(c.r,c.g,c.b);ids.push(t,i/curves);
   }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setAttribute('aPhase',new THREE.Float32BufferAttribute(ids,2));
  this.galaxyMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,uniforms:{uTime:{value:0},uOpacity:{value:1}},vertexShader:`attribute vec2 aPhase; varying vec3 vColor; varying vec2 vPhase; void main(){vColor=color;vPhase=aPhase;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float uTime;uniform float uOpacity;varying vec3 vColor;varying vec2 vPhase;void main(){float a=sin(vPhase.x*3.14159);float pulse=pow(max(0.,sin(vPhase.x*8.-uTime*.7+vPhase.y*31.)),20.);gl_FragColor=vec4(vColor*(.4+pulse*1.8),(.14+a*.25+pulse*.38)*uOpacity);}`});
  this.root.add(new THREE.LineSegments(geo,this.galaxyMat));
 }
 createStars(){
  const n=this.lowPower?10000:18000,pos=new Float32Array(n*3),col=new Float32Array(n*3),sizes=new Float32Array(n);
  for(let i=0;i<n;i++){
   const radius=Math.pow(random(),.6)*38,arm=i%4,angle=arm*TAU/4+radius*.12+(random()-.5)*.7;
   const outside=i%7===0;
   pos[i*3]=outside?(random()-.5)*160:Math.cos(angle)*radius;
   pos[i*3+1]=outside?(random()-.5)*100:(random()-.5)*1.6*(.4+radius*.13);
   pos[i*3+2]=outside?(random()-.5)*150:Math.sin(angle)*radius*.78;
   const color=new THREE.Color().setHSL(.47+random()*.2,.2+random()*.3,.38+random()*.48);
   col[i*3]=color.r;col[i*3+1]=color.g;col[i*3+2]=color.b;sizes[i]=random()<.025?3.8:random()*1.9+.3;
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
  this.starMat=new THREE.ShaderMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uOpacity:{value:1},uPixelRatio:{value:this.renderer.getPixelRatio()}},vertexShader:`attribute float aSize;varying vec3 vColor;uniform float uTime;uniform float uPixelRatio;void main(){vColor=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(aSize*100./max(6.,-p.z),.7,8.)*uPixelRatio;}`,fragmentShader:`varying vec3 vColor;uniform float uOpacity;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float a=pow(1.-d,2.);gl_FragColor=vec4(vColor,a*.85*uOpacity);}`});
  this.root.add(new THREE.Points(g,this.starMat));
 }
 createWarp(){
  const n=12000,pos=[],data=[],col=[];
  for(let i=0;i<n;i++){
   const angle=random()*TAU,r=5+random()*105,z=random()*220;
   const c=new THREE.Color().setHSL(.48+random()*.22,.45,.18+random()*.5);
   for(const end of [0,1]){pos.push(Math.cos(angle)*r,Math.sin(angle)*r*.75,-z);data.push(end,random()*.6+.4);col.push(c.r,c.g,c.b);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aData',new THREE.Float32BufferAttribute(data,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  this.warpMat=new THREE.ShaderMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTravel:{value:0},uSpeed:{value:0},uOpacity:{value:0}},vertexShader:`attribute vec2 aData;uniform float uTravel;uniform float uSpeed;varying vec3 vColor;varying float vAlpha;void main(){vColor=color;vec3 p=position;p.z=mod(position.z+uTravel,220.)-170.;p.z-=aData.x*(.15+uSpeed*18.);vAlpha=(1.-aData.x*.78)*smoothstep(-170.,-100.,p.z);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`uniform float uOpacity;varying vec3 vColor;varying float vAlpha;void main(){gl_FragColor=vec4(vColor,vAlpha*uOpacity);}`});
  this.warp=new THREE.LineSegments(g,this.warpMat);this.scene.add(this.warp);this.travel=0;
 }
 createCore(){
  const g=new THREE.PlaneGeometry(22,22);this.coreMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uOpacity:{value:.6}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float uOpacity;void main(){float d=length((vUv-.5)*2.);float a=exp(-d*7.)*.75+exp(-d*2.8)*.035;gl_FragColor=vec4(.45,.77,.75,a*uOpacity);}`});
  this.core=new THREE.Mesh(g,this.coreMat);this.core.position.copy(this.root.position);this.scene.add(this.core);
 }
 disposeRoutes(){this.routes.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});this.routes.clear();this.branchObjects=[];this.branchPaths=[];}
 buildRoutes(step=0){
  this.disposeRoutes();
  const mobile=innerWidth<600;
  this.endpoints=mobile?[new THREE.Vector3(-7,2,-2),new THREE.Vector3(6,-3,-5),new THREE.Vector3(-1,-10,0)]:[new THREE.Vector3(10,8,0),new THREE.Vector3(15,-.4,-5),new THREE.Vector3(10,-9,1)];
  const start=new THREE.Vector3(-2,-3,17);
  for(let i=0;i<3;i++){
   const end=this.endpoints[i];const bend=(step%2?1:-1)*2;
   const curve=new THREE.CatmullRomCurve3([start.clone(),new THREE.Vector3(3+bend,-2,9),new THREE.Vector3(end.x-2,end.y*.72,3),end.clone()]);this.branchPaths.push(curve);
   const meshes=[];
   for(const [radius,opacity] of [[.023,.98],[.075,.10],[.19,.025]]){
    const mat=new THREE.MeshBasicMaterial({color:palette[i],transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending});
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,100,radius,5,false),mat);mesh.userData.baseOpacity=opacity;this.routes.add(mesh);meshes.push(mesh);
   }
   const dot=new THREE.Mesh(new THREE.SphereGeometry(.13,10,10),new THREE.MeshBasicMaterial({color:palette[i],transparent:true,opacity:.95}));dot.position.copy(end);this.routes.add(dot);meshes.push(dot);
   const pulse=new THREE.Mesh(new THREE.SphereGeometry(.075,8,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}));this.routes.add(pulse);meshes.push(pulse);
   this.branchObjects.push({meshes,pulse,dot});
  }
  // The history feeding the shared origin remains one continuous path.
  const past=new THREE.CatmullRomCurve3([new THREE.Vector3(-22,-17,1),new THREE.Vector3(-9,-7,11),start]);
  const m=new THREE.MeshBasicMaterial({color:0x789ba6,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending});
  this.routes.add(new THREE.Mesh(new THREE.TubeGeometry(past,70,.028,5,false),m));this.routes.visible=true;
 }
 setStage(stage,step=0){
  this.stage=stage;this.focus=-1;this.routeOpacity=0;this.flight=null;
  if(stage==='intro'){this.disposeRoutes();this.targetCamera.set(0,5,66);this.targetLook.set(1,0,0);this.introStart=this.elapsed;}
  else if(stage==='finish'){this.routes.visible=false;this.targetCamera.set(-7,12,66);this.targetLook.set(8,0,0);}
  else{this.buildRoutes(step);this.targetCamera.set(0,1,47);this.targetLook.set(0,0,0);}
 }
 setFocus(i){this.focus=i;}
 flyThrough(i){
  if(this.paused||this.reduced||!this.endpoints?.[i])return;
  this.focus=i;
  const end=this.endpoints[i].clone();
  this.flight={start:this.cam.clone(),end:end.clone().add(new THREE.Vector3(-1,2,12)),look:this.look.clone(),target:end,age:0};
  if(this.ripple){this.scene.remove(this.ripple);this.ripple.geometry.dispose();this.ripple.material.dispose();}
  this.ripple=new THREE.Mesh(new THREE.RingGeometry(.98,1,96),new THREE.MeshBasicMaterial({color:palette[i],transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
  this.ripple.position.copy(end);this.ripple.quaternion.copy(this.camera.quaternion);this.rippleAge=0;this.scene.add(this.ripple);
 }
 burst(){if(!this.paused&&!this.reduced)this.boost=1;}
 setPaused(paused){this.paused=paused;if(paused)this.boost=0;}
 resize(){this.w=innerWidth;this.h=innerHeight;this.camera.aspect=this.w/this.h;this.camera.updateProjectionMatrix();this.renderer.setSize(this.w,this.h);if(this.stage==='goal'||this.stage==='choice')this.buildRoutes(0);}
 animate(){
  this.frame=requestAnimationFrame(()=>this.animate());const now=performance.now();if(now-this.last<1000/45)return;const dt=Math.min((now-this.last)/1000,.05);this.last=now;
  if(document.hidden)return;
  const active=!this.paused&&!this.reduced;if(active)this.elapsed+=dt;
  const introAge=this.elapsed-(this.introStart||0);
  const introVelocity=this.stage==='intro'&&introAge<4?Math.max(0,1-introAge/4):0;
  this.boost=Math.max(0,this.boost-dt*.63);const speed=active?Math.max(this.boost,introVelocity):0;
  this.travel+=dt*(speed*130+1.8);this.warpMat.uniforms.uTravel.value=this.travel;this.warpMat.uniforms.uSpeed.value=speed;this.warpMat.uniforms.uOpacity.value=speed*.75;
  this.galaxyMat.uniforms.uTime.value=this.elapsed;this.starMat.uniforms.uTime.value=this.elapsed;
  const opacity=this.stage==='intro'?1:this.stage==='finish'?.6:.3;
  this.galaxyOpacity=lerp(this.galaxyOpacity,opacity,dt*1.8);
  this.galaxyMat.uniforms.uOpacity.value=this.galaxyOpacity;this.starMat.uniforms.uOpacity.value=this.galaxyOpacity*.9+.1;
  this.coreMat.uniforms.uOpacity.value=this.galaxyOpacity*.7;
  const rot=this.elapsed*.015;
  this.root.rotation.y=rot+this.drag.x*.3;
  this.root.rotation.x=lerp(this.root.rotation.x,.62+this.drag.y*.25+(active?this.pointer.y*.06:0),dt*1.8);
  this.core.quaternion.copy(this.camera.quaternion);
  if(this.flight&&active){
   this.flight.age+=dt;const t=Math.min(1,this.flight.age/1.35),e=t*t*(3-2*t);
   this.cam.lerpVectors(this.flight.start,this.flight.end,e);this.look.lerpVectors(this.flight.look,this.flight.target,e);
  }else{this.cam.lerp(this.targetCamera,active?.035:1);this.look.lerp(this.targetLook,active?.035:1);}
  if(this.ripple){this.rippleAge+=dt;this.ripple.scale.setScalar(1+this.rippleAge*20);this.ripple.material.opacity=Math.max(0,.55-this.rippleAge*.4);}
  this.camera.position.copy(this.cam);if(active){this.camera.position.x+=this.pointer.x*1.3;this.camera.position.y-=this.pointer.y*.7;this.camera.position.z-=speed*9;}
  this.camera.lookAt(this.look);
  this.routeOpacity=lerp(this.routeOpacity,1,dt*2);
  for(let i=0;i<this.branchObjects.length;i++){
   const {meshes,pulse,dot}=this.branchObjects[i];const gain=this.focus<0?1:this.focus===i?1.3:.28;
   for(const mesh of meshes){mesh.material.opacity=Math.min(1,(mesh.userData.baseOpacity??.9)*gain*this.routeOpacity);}
   const t=(this.elapsed*.12+i*.31)%1;pulse.position.copy(this.branchPaths[i].getPoint(t));dot.scale.setScalar(this.focus===i?1.6:1);
  }
  this.scene.updateMatrixWorld();this.camera.updateMatrixWorld();
  if(this.endpoints&&(this.stage==='goal'||this.stage==='choice')){
   this.onProject(this.endpoints.map(p=>{const v=p.clone().project(this.camera);return {x:(v.x*.5+.5)*this.w,y:(-v.y*.5+.5)*this.h};}));
  }
  this.renderer.render(this.scene,this.camera);
 }
 destroy(){cancelAnimationFrame(this.frame);this.listeners.forEach(fn=>fn());this.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});this.renderer.dispose();}
}
