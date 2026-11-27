import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let current = null;
const colors = { body:0x526f8e, glass:0x9fc5dc, trim:0x1c2936, tyre:0x17202a, metal:0x9aa9b7, engine:0x3e4b59, accent:0x1769e0 };

function box(parent, name, size, pos, color, opts={}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({color, roughness:opts.roughness ?? .55, metalness:opts.metalness ?? .12, transparent:!!opts.transparent, opacity:opts.opacity ?? 1}));
  mesh.name=name; mesh.position.set(...pos); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cylinder(parent,name,r1,r2,length,pos,rot,color,segments=24) {
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,length,segments),new THREE.MeshStandardMaterial({color,roughness:.55,metalness:.25}));
  mesh.name=name; mesh.position.set(...pos); mesh.rotation.set(...rot); mesh.castShadow=true; parent.add(mesh); return mesh;
}
function wheel(parent,x,z) {
  const group=new THREE.Group(); group.position.set(x,.48,z); parent.add(group);
  cylinder(group,'tyre',.48,.48,.27,[0,0,0],[0,0,Math.PI/2],colors.tyre,32);
  cylinder(group,'alloy wheel',.31,.31,.29,[0,0,0],[0,0,Math.PI/2],0x9eabb8,32);
  cylinder(group,'hub',.105,.105,.30,[0,0,0],[0,0,Math.PI/2],0x526477,20);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5; const spoke=box(group,'alloy spoke',[.055,.27,.035],[0,Math.cos(a)*.16,Math.sin(a)*.16],0xd4dde5);spoke.rotation.x=a;}
  return group;
}
function makeExterior(root, transparent=false) {
  const shell=new THREE.Group(); root.add(shell);
  const bodyMat = new THREE.MeshStandardMaterial({color:colors.body,roughness:.35,metalness:.35,transparent,opacity:transparent?.22:1,depthWrite:!transparent});
  const lower=new THREE.Mesh(new THREE.BoxGeometry(2.05,.48,4.35),bodyMat); lower.position.y=.92; lower.castShadow=true; shell.add(lower);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.72,.86,2.25),new THREE.MeshStandardMaterial({color:transparent?colors.glass:colors.glass,roughness:.2,metalness:.15,transparent:true,opacity:transparent?.13:.62,depthWrite:false}));
  cabin.position.set(0,1.52,-.12); shell.add(cabin);
  const roof=box(shell,'roof',[1.62,.12,1.62],[0,2.02,-.08],colors.body);
  // front/rear fascia and grille
  box(shell,'front grille',[1.02,.22,.07],[0,.96,2.19],0x172431);
  box(shell,'front bumper',[1.9,.22,.22],[0,.66,2.16],0x293b4e);
  box(shell,'rear bumper',[1.9,.2,.2],[0,.67,-2.18],0x293b4e);
  for(const x of [-.72,.72]){box(shell,'headlamp',[.38,.13,.08],[x,1.12,2.21],0xdceeff);box(shell,'tail lamp',[.34,.16,.08],[x,1.15,-2.21],0xc83e3e);}
  // window frames, pillars and mirrors
  for(const x of [-.86,.86]){box(shell,'side window',[.035,.58,1.86],[x,1.58,-.1],0x31536b,{transparent:true,opacity:.9});box(shell,'mirror',[.2,.13,.22],[x*1.13,1.48,1.05],colors.trim);}
  // roof rails
  for(const x of [-.67,.67])box(shell,'roof rail',[.045,.055,1.55],[x,2.11,-.1],0xc6d0da);
  for(const x of [-.98,.98])for(const z of [-1.35,1.35])wheel(root,x,z);
  // floor and visible underbody rails
  box(root,'chassis floor',[1.48,.16,3.35],[0,.55,-.02],0x374656);
  return shell;
}
function makeEngine(root) {
  box(root,'engine block',[1.05,.62,1.12],[0,.9,1.18],colors.engine);
  box(root,'valve cover',[.86,.16,.85],[0,1.3,1.18],0x273441);
  box(root,'intake manifold',[.7,.25,.42],[0,1.48,.76],0x687887);
  box(root,'air cleaner',[.62,.32,.65],[.72,1.03,.5],0x252f39);
  box(root,'battery',[.42,.34,.34],[-.72,1.02,.85],0x263746);
  cylinder(root,'alternator',.22,.22,.28,[-.55,.75,1.48],[0,0,Math.PI/2],0x9aa8b4);
  cylinder(root,'radiator',.82,.82,.12,[0,.78,2.0],[Math.PI/2,0,0],0x647d91);
  cylinder(root,'cooling fan',.35,.35,.08,[0,.78,1.9],[Math.PI/2,0,0],0x202e3c,20);
  box(root,'fuse box',[.34,.22,.3],[.78,1.04,1.45],0x303d4c);
  cylinder(root,'brake fluid reservoir',.16,.16,.25,[-.8,1.4,1.7],[0,0,0],0xe5e9e8,16);
  cylinder(root,'oil filler cap',.12,.12,.08,[.22,1.42,1.16],[0,0,0],0xd8a12f,16);
}
function makeUnderbody(root) {
  box(root,'exhaust pipe',[.12,.12,3.7],[.35,.42,-.05],0x8b969f);
  cylinder(root,'exhaust silencer',.38,.38,.8,[.35,.43,-1.35],[Math.PI/2,0,0],0x77838c);
  box(root,'fuel tank',[1.1,.25,.8],[-.48,.42,-.9],0x596a78);
  box(root,'transmission',[.8,.42,.95],[0,.58,.35],0x667581);
  cylinder(root,'propeller shaft',.08,.08,1.65,[0,.48,-.85],[Math.PI/2,0,0],0x9da8b1);
  for(const x of [-.9,.9])for(const z of [-1.35,1.35]){
    cylinder(root,'brake disc',.28,.28,.09,[x,.49,z],[0,0,Math.PI/2],0x9ba7b2);
    box(root,'suspension arm',[.12,.12,.85],[x*.65,.45,z*.72],0x647587);
    cylinder(root,'damper',.075,.075,.62,[x,.77,z],[0,0,0],0xb4c1cc);
  }
}
const hotspotSets = {
  bay:[['battery',[-.72,1.28,.85]],['alternator',[-.55,.85,1.48]],['airfilter',[.72,1.2,.5]],['radiator',[0,.9,2]],['oilcap',[.22,1.52,1.16]],['brakefluid',[-.8,1.55,1.7]],['fusebox',[.78,1.2,1.45]]],
  under:[['starter',[.18,.7,.2]],['brakecaliper',[.98,.62,1.35]],['shock',[.98,1,1.35]],['controlarm',[-.65,.5,1]],['driveshaft',[0,.55,.3]],['exhaust',[.35,.52,-.1]],['fuelpump',[-.48,.6,-.9]]],
  body:[['battery',[-1.02,1.72,.82]],['radiator',[0,1.48,2.35]],['brakecaliper',[1.28,.72,1.35]],['exhaust',[.82,.48,-2.22]]]
};
export function mountVehicleViewer(zone, selectedId, onSelect) {
  const host=document.getElementById('vehicleDrawing'); if(!host)return;
  if(current){current.dispose();current=null;}
  // Use the actual Kia Sportage QL 2015–2021 model for the exterior overview.
  // The engine-bay and underbody scenes below remain instructional schematics.
  if(zone==='body'){
    host.innerHTML = '<div class="viewerbar"><span class="viewer-status">Actual Kia Sportage QL · 2015–2021</span><a href="https://sketchfab.com/3d-models/kia-sportage-gt-line-ql-2015-2021-89cc320440ef47c289c8b4f04ffee008" target="_blank" rel="noopener noreferrer">Open model source ↗</a></div><div class="three-stage" style="height: min(68vh,620px);min-height:340px;padding:0;overflow:hidden"><iframe title="Interactive Kia Sportage GT-Line QL 2015–2021 3D model by Merc_TV" src="https://sketchfab.com/models/89cc320440ef47c289c8b4f04ffee008/embed?autostart=0&ui_theme=dark" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy" style="display:block;width:100%;height:100%;border:0"></iframe></div><div class="model-legend">Real Sportage QL exterior model hosted by Sketchfab. Drag to rotate, scroll or pinch to zoom. This is an exterior model; it does not expose the engine, chassis or internal components.</div>';
    return {dispose:()=>{host.innerHTML='';}};
  }

  host.innerHTML='<div class="viewerbar"><button data-cmd="reset">Reset view</button><button data-cmd="engine">Engine detail</button><button data-cmd="transparent">Show structure</button></div><div class="three-stage" id="threeStage"><canvas id="vehicleCanvas" aria-label="Interactive three dimensional vehicle learning model"></canvas><div class="three-label" id="threeLabel">Drag to orbit · Pinch or scroll to zoom · Tap a marker to study a part</div></div><div class="model-legend">Learning model · component locations are illustrative and variant-dependent</div>';
  const canvas=host.querySelector('canvas'),stage=host.querySelector('#threeStage');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.setClearColor(0xe7eef6,0);
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0xe7eef6);
  const camera=new THREE.PerspectiveCamera(38,1,.1,100); camera.position.set(5.7,4.1,6.6);
  const controls=new OrbitControls(camera,canvas); controls.enableDamping=true; controls.dampingFactor=.07; controls.minDistance=4.2; controls.maxDistance=12; controls.maxPolarAngle=Math.PI*.49; controls.target.set(0,.95,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x63758a,2.1));
  const key=new THREE.DirectionalLight(0xffffff,2.2); key.position.set(4,8,5); key.castShadow=true; scene.add(key);
  const fill=new THREE.DirectionalLight(0xc6e0ff,1.1); fill.position.set(-5,3,-4); scene.add(fill);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(5.5,48),new THREE.MeshStandardMaterial({color:0xd4e0eb,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=.02;floor.receiveShadow=true;scene.add(floor);
  const car=new THREE.Group();scene.add(car); const shell=makeExterior(car,zone==='bay'||zone==='under');
  if(zone==='bay')makeEngine(car); if(zone==='under')makeUnderbody(car);
  if(zone==='bay'){const hood=box(car,'open bonnet',[1.95,.12,1.05],[0,2.2,1.55],colors.body);hood.rotation.x=-.55;}
  if(zone==='under'){shell.visible=false;const floorPart=car.children.find(o=>o.name==='chassis floor');if(floorPart)floorPart.visible=false;}
  if(zone==='body'){car.children.forEach(o=>{if(o.name==='chassis floor')o.visible=false;});}
  const markers=new THREE.Group();scene.add(markers);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(); let markerMeshes=[];
  for(const [id,pos] of (hotspotSets[zone]||[])){
    const part=new THREE.Mesh(new THREE.SphereGeometry(id===selectedId ? .115 : .085,16,12),new THREE.MeshStandardMaterial({color:id===selectedId?0xffae32:0x1769e0,emissive:id===selectedId?0x6b3700:0x052a64,roughness:.35}));
    markers.add(part);part.position.set(...pos);part.userData.partId=id;markerMeshes.push(part);
  }
  const label=host.querySelector('#threeLabel');
  const resize=()=>{const w=Math.max(240,stage.clientWidth),h=Math.max(210,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();
  const onPointer=e=>{const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(markerMeshes);if(hits.length){const id=hits[0].object.userData.partId;onSelect(id);}};
  canvas.addEventListener('click',onPointer);
  host.querySelectorAll('[data-cmd]').forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.cmd==='reset'){camera.position.set(5.7,4.1,6.6);controls.target.set(0,.95,0);controls.update();}
    if(b.dataset.cmd==='engine'){if(zone!=='bay')return;car.children.forEach(o=>{if(['open bonnet'].includes(o.name))o.visible=true;});camera.position.set(3.5,3.4,4.6);controls.target.set(0,1.1,1.25);controls.update();}
    if(b.dataset.cmd==='transparent'){shell.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=.16;}});}
  }));
  let raf=0,alive=true;function animate(){if(!alive)return;raf=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();
  current={controls,renderer,observer,dispose:()=>{alive=false;cancelAnimationFrame(raf);canvas.removeEventListener('click',onPointer);}};
  const oldDispose=current.dispose;
  current.observer=observer;
  // Preserve clean teardown when the zone or selection changes.
  const originalDispose=current.dispose;
  current.dispose=()=>{originalDispose();controls.dispose();renderer.dispose();observer.disconnect();};
  return current;
}
