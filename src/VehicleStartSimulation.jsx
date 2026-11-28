import React, { useEffect, useRef, useState } from 'react';

const phases = [
  { id:'off', title:'1 · Key OFF', short:'Vehicle asleep', detail:'The engine is stopped. The battery supplies only standby loads. The crankshaft, pistons, camshafts, oil pump and alternator are stationary.', active:[] },
  { id:'ignition', title:'2 · Ignition ON', short:'Systems wake up', detail:'The battery powers the control modules and instrument cluster. The ECU performs checks; the electric fuel pump may prime briefly. Warning lamps illuminate for their self-check.', active:['battery','ecu','fuel'] },
  { id:'cranking', title:'3 · Cranking', short:'Starter turns engine', detail:'The starter solenoid engages the ring gear. The starter motor turns the flywheel and crankshaft. Pistons and camshafts move; the ECU reads crankshaft and camshaft signals.', active:['battery','starter','crank','pistons','valves','ecu','fuel','oil'] },
  { id:'firing', title:'4 · First combustion', short:'Engine catches', detail:'With valid sensor signals, the ECU commands injector pulses and ignition spark. Combustion pushes the pistons down and the crankshaft accelerates. The starter disengages as the engine runs.', active:['crank','pistons','valves','ecu','fuel','spark','oil','exhaust'] },
  { id:'idle', title:'5 · Stable idle', short:'Engine running', detail:'Combustion sustains rotation. The alternator generates electrical power; the oil pump circulates oil; the coolant pump circulates coolant. The ECU adjusts air, fuel and ignition to maintain idle.', active:['crank','pistons','valves','ecu','fuel','spark','oil','exhaust','alternator','coolant'] }
];

const components = {
  battery:{name:'Battery',local:'Car battery',where:'Engine bay or designated battery compartment',what:'Supplies electrical energy for control modules, fuel-pump priming and the high current required by the starter.',motion:'Electrical current flows when circuits are switched on. The battery itself has no moving external parts.',fault:'Low state of charge or high internal resistance can cause dim lamps, clicking or slow/no cranking.'},
  ecu:{name:'Engine control unit',local:'ECU / engine computer',where:'Mounted in the engine bay or cabin, depending on vehicle',what:'Reads sensor signals and controls fuel injection, ignition timing and other engine functions.',motion:'Electronic control: it wakes at ignition ON, checks inputs and calculates commands during cranking and idle.',fault:'Power, ground, wiring or sensor faults can prevent starting or cause warning lights and poor running.'},
  fuel:{name:'Fuel pump & injectors',local:'Fuel pump / injectors',where:'Pump commonly in the fuel tank; injectors at the intake ports or cylinder head',what:'Delivers fuel at the pressure and quantity required by the engine.',motion:'The electric pump may prime at ignition ON. During cranking/running, injectors pulse when commanded by the ECU.',fault:'Low pressure, blocked filter, poor supply or injector faults can cause long cranking, misfire or no-start.'},
  starter:{name:'Starter motor & solenoid',local:'Starter / starter relay',where:'Bolted to the engine or transmission bellhousing near the flywheel',what:'Uses battery power to rotate the engine until combustion becomes self-sustaining.',motion:'The solenoid pushes the pinion into the flywheel ring gear; the motor spins the crankshaft. It disengages after the engine catches.',fault:'Clicking, slow cranking, grinding or no crank. Test battery, cables and voltage drop before condemning it.'},
  crank:{name:'Crankshaft & flywheel',local:'Crank / flywheel',where:'Lower engine block; flywheel at the transmission end',what:'The crankshaft converts piston movement into rotation. The flywheel smooths rotation and provides the starter ring gear.',motion:'The starter rotates it during cranking; combustion keeps it rotating after the engine fires.',fault:'Bearing wear or damage may cause deep knocking, vibration, low oil pressure or failure to rotate.'},
  pistons:{name:'Pistons & connecting rods',local:'Pistons / con-rods',where:'Inside the engine cylinders, above the crankshaft',what:'Pistons receive combustion force; connecting rods transfer that force to the crankshaft.',motion:'All pistons reciprocate up and down. Their strokes are offset so the engine delivers smoother torque.',fault:'Wear or damage can cause low compression, oil consumption, smoke, knocking or misfire.'},
  valves:{name:'Camshaft & valves',local:'Cam / intake and exhaust valves',where:'Cylinder head, above the combustion chambers',what:'Controls when fresh air enters and exhaust gases leave each cylinder.',motion:'The camshaft rotates in time with the crankshaft. Valves open and close in the correct sequence.',fault:'Incorrect timing or poor sealing can cause hard starting, misfire, low compression or serious engine damage.'},
  spark:{name:'Ignition system',local:'Spark plugs / ignition coils',where:'At the top of each petrol-engine cylinder',what:'Ignites the compressed air-fuel mixture in a petrol engine.',motion:'The ECU triggers ignition coils at the correct crank angle. Spark occurs near the end of compression.',fault:'Worn plugs or failed coils can cause misfire, rough idle, poor power and increased fuel use.'},
  oil:{name:'Lubrication system',local:'Oil pump / oil galleries',where:'Oil pump and pickup in lower engine; galleries through the block and head',what:'Delivers pressurised engine oil to bearings and moving surfaces to reduce friction and carry heat.',motion:'The pump is driven by the engine. Pressure builds as the crankshaft turns; oil circulates while running.',fault:'Low oil level, blocked pickup or low pressure can rapidly damage bearings and other moving parts.'},
  alternator:{name:'Alternator & belt',local:'Alternator / accessory belt',where:'Bolted to the engine and driven by the accessory belt',what:'Generates electrical power for vehicle systems and replenishes the battery while the engine runs.',motion:'The crankshaft pulley drives the belt, which spins the alternator rotor after the engine starts.',fault:'A slipping belt or alternator fault can trigger the battery lamp and lead to a discharged battery.'},
  coolant:{name:'Cooling system',local:'Water pump / radiator / fan',where:'Pump on engine; radiator and fan at the front of the vehicle',what:'Moves coolant through the engine and radiator to control operating temperature.',motion:'The pump circulates coolant as the engine runs. The thermostat regulates radiator flow; the fan operates when needed.',fault:'Leaks, poor circulation or fan faults can cause overheating. Never open a hot cooling system.'},
  exhaust:{name:'Exhaust system',local:'Exhaust manifold / catalytic converter / silencer',where:'From cylinder head, underneath vehicle, to rear outlet',what:'Carries burnt gases away and reduces emissions and noise.',motion:'Exhaust gases leave each cylinder when the exhaust valve opens and flow through the exhaust system.',fault:'Leaks, blockages or damaged supports can cause noise, fumes, poor performance or unsafe exhaust entry.'}
};
const order=['battery','ecu','fuel','starter','crank','pistons','valves','spark','oil','alternator','coolant','exhaust'];
const COLORS={body:[.12,.34,.55],glass:[.19,.42,.56],rubber:[.045,.06,.08],metal:[.48,.58,.67],engine:[.34,.41,.48],gold:[.86,.59,.24],electric:[.18,.64,.96],fuel:[.95,.59,.17],oil:[.83,.68,.25],coolant:[.17,.72,.77],exhaust:[.48,.53,.58],highlight:[1,.77,.25]};

function matMul(a,b){const o=new Float32Array(16);for(let r=0;r<4;r++)for(let c=0;c<4;c++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;}
function identity(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
function modelMatrix(pos,rot,scale){let m=identity();const [x,y,z]=rot;const rx=new Float32Array([1,0,0,0,0,Math.cos(x),Math.sin(x),0,0,-Math.sin(x),Math.cos(x),0,0,0,0,1]);const ry=new Float32Array([Math.cos(y),0,-Math.sin(y),0,0,1,0,0,Math.sin(y),0,Math.cos(y),0,0,0,0,1]);const rz=new Float32Array([Math.cos(z),Math.sin(z),0,0,-Math.sin(z),Math.cos(z),0,0,0,0,1,0,0,0,0,1]);m=matMul(matMul(matMul(m,ry),rx),rz);m[0]*=scale[0];m[1]*=scale[0];m[2]*=scale[0];m[4]*=scale[1];m[5]*=scale[1];m[6]*=scale[1];m[8]*=scale[2];m[9]*=scale[2];m[10]*=scale[2];m[12]=pos[0];m[13]=pos[1];m[14]=pos[2];return m;}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);}
function lookAt(eye,target){const z=norm([eye[0]-target[0],eye[1]-target[1],eye[2]-target[2]]),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}function norm(v){const l=Math.hypot(...v)||1;return v.map(n=>n/l);}
function box(){const p=[-1,-1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,1,1];const faces=[[0,1,2,0,2,3],[4,6,5,4,7,6],[0,4,5,0,5,1],[3,2,6,3,6,7],[1,5,6,1,6,2],[0,3,7,0,7,4]];return faces.flat().flatMap(i=>p.slice(i*3,i*3+3));}
function cylinder(segments=16){const out=[];for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;const p=[Math.cos(a),-1,Math.sin(a),Math.cos(b),-1,Math.sin(b),Math.cos(b),1,Math.sin(b),Math.cos(a),1,Math.sin(a)];out.push(...p.slice(0,3),...p.slice(3,6),...p.slice(6,9),...p.slice(0,3),...p.slice(6,9),...p.slice(9,12));out.push(0,-1,0,...p.slice(3,6),...p.slice(0,3),0,1,0,...p.slice(9,12),...p.slice(6,9));}return out;}
const MESH={box:box(),cylinder:cylinder()};
function makeObjects(t,phase,selected){
 const running=phase>=2, speed=phase===2?1:phase===3?2.4:phase===4?.8:0, spin=t*speed;
 const objects=[];
 const add=(id,shape,pos,scale,color,rot=[0,0,0])=>objects.push({id,shape,pos,scale,color: id===selected?COLORS.highlight:color,rot});
 // body shell, chassis, glass and cabin
 add('body','box',[0,.83,0],[4.35,.13,1.58],COLORS.body);
 add('body','box',[0,1.12,-1.5],[4.25,.32,.12],COLORS.body);
 add('body','box',[0,1.12,1.5],[4.25,.32,.12],COLORS.body);
 add('body','box',[-.15,1.68,0],[2.2,.72,1.38],COLORS.body,[0,0,-.08]);
 add('body','box',[-.15,2.05,0],[1.75,.48,1.26],COLORS.glass,[0,0,-.08]);
 add('body','box',[1.48,1.45,0],[.48,.28,1.35],COLORS.body);
 add('body','box',[-1.75,1.4,0],[.45,.24,1.35],COLORS.body);
 // wheels, axles and hubs
 for(const x of [-2.75,2.72])for(const z of [-1.55,1.55]){add('wheels','cylinder',[x,.72,z],[.68,.24,.68],COLORS.rubber,[Math.PI/2,0,spin]);add('wheels','cylinder',[x,.72,z*1.012],[.36,.25,.36],COLORS.metal,[Math.PI/2,0,spin]);}
 add('crank','cylinder',[1.5,.95,0],[.28,.82,.28],COLORS.metal,[Math.PI/2,0,spin]);
 // engine block and head
 add('crank','box',[1.52,1.45,0],[1.05,.75,.78],COLORS.engine);
 add('valves','box',[1.52,2.22,0],[1.06,.22,.78],COLORS.metal);
 for(let i=0;i<4;i++){const x=.88+i*.42;const y=1.82+(running?Math.sin(t*speed*4+i*Math.PI)*.2:0);add('pistons','box',[x,y,0],[.16,.22,.48],COLORS.gold);add('valves','cylinder',[x,2.43,0],[.055,.25,.055],COLORS.metal,[0,0,running?Math.sin(t*speed*4+i)*.45:0]);}
 add('crank','cylinder',[1.52,1.12,0],[.13,.65,.13],COLORS.gold,[0,0,spin]);
 add('starter','cylinder',[.65,1.1,-.95],[.25,.52,.25],COLORS.electric,[Math.PI/2,0,0]);
 add('battery','box',[-2.95,1.45,-.8],[.42,.32,.34],COLORS.electric);
 add('ecu','box',[-2.25,1.72,-.78],[.35,.12,.28],COLORS.metal);
 add('fuel','box',[2.2,.42,0],[.55,.3,.62],COLORS.fuel);
 add('fuel','cylinder',[1.45,2.5,0],[.07,.22,.07],COLORS.fuel);
 add('spark','cylinder',[1.0,2.5,0],[.055,.18,.055],COLORS.highlight);
 add('alternator','cylinder',[2.25,1.05,-.9],[.25,.32,.25],COLORS.metal,[0,0,spin*1.8]);
 add('oil','cylinder',[1.05,.8,.7],[.22,.16,.22],COLORS.oil,[0,0,spin]);
 add('coolant','box',[3.05,1.25,0],[.22,.72,.72],COLORS.coolant);
 add('exhaust','cylinder',[1.65,.55,.8],[.12,1.0,.12],COLORS.exhaust,[0,0,Math.PI/2]);
 add('exhaust','cylinder',[2.5,.35,.8],[.16,.55,.16],COLORS.exhaust,[0,0,Math.PI/2]);
 return objects;
}

function ThreeDStartScene({phase,selected,onSelect}){
 const canvasRef=useRef(null), stateRef=useRef({yaw:.72,pitch:.42,distance:9,drag:false,x:0,y:0}), phaseRef=useRef(phase), selectedRef=useRef(selected);
 phaseRef.current=phase;selectedRef.current=selected;
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
  if(!gl){canvas.dataset.error='WebGL is unavailable in this browser.';return;}
  const vs='attribute vec3 aPosition;uniform mat4 uMVP;void main(){gl_Position=uMVP*vec4(aPosition,1.0);}';
  const fs='precision mediump float;uniform vec3 uColor;void main(){gl_FragColor=vec4(uColor,1.0);}';
  const compile=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh;};
  const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);const posLoc=gl.getAttribLocation(program,'aPosition'),mvpLoc=gl.getUniformLocation(program,'uMVP'),colorLoc=gl.getUniformLocation(program,'uColor');
  const buffers={};Object.entries(MESH).forEach(([name,data])=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);buffers[name]={buffer:b,count:data.length/3};});
  gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.clearColor(.035,.065,.105,1);
  let raf=0,start=performance.now(),lastW=0,lastH=0;
  const render=now=>{const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);if(w!==lastW||h!==lastH){lastW=w;lastH=h;canvas.width=Math.round(w*Math.min(devicePixelRatio||1,1.5));canvas.height=Math.round(h*Math.min(devicePixelRatio||1,1.5));gl.viewport(0,0,canvas.width,canvas.height);}
   gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const s=stateRef.current,eye=[Math.sin(s.yaw)*s.distance*Math.cos(s.pitch),3+Math.sin(s.pitch)*s.distance*.55,Math.cos(s.yaw)*s.distance*Math.cos(s.pitch)];const vp=matMul(perspective(.72,canvas.width/canvas.height,.1,80),lookAt(eye,[0,1.15,0]));
   const objects=makeObjects((now-start)/1000,phaseRef.current,selectedRef.current);
   objects.forEach(o=>{const b=buffers[o.shape];gl.bindBuffer(gl.ARRAY_BUFFER,b.buffer);gl.enableVertexAttribArray(posLoc);gl.vertexAttribPointer(posLoc,3,gl.FLOAT,false,0,0);gl.uniformMatrix4fv(mvpLoc,false,matMul(vp,modelMatrix(o.pos,o.rot,o.scale)));gl.uniform3fv(colorLoc,o.color);gl.drawArrays(gl.TRIANGLES,0,b.count);});
   raf=requestAnimationFrame(render);
  };
  raf=requestAnimationFrame(render);
  const pointerDown=e=>{stateRef.current.drag=true;stateRef.current.x=e.clientX;stateRef.current.y=e.clientY;canvas.setPointerCapture?.(e.pointerId);};
  const pointerMove=e=>{const s=stateRef.current;if(!s.drag)return;const dx=e.clientX-s.x,dy=e.clientY-s.y;s.yaw+=dx*.008;s.pitch=Math.max(-.05,Math.min(1.25,s.pitch+dy*.006));s.x=e.clientX;s.y=e.clientY;};
  const pointerUp=()=>{stateRef.current.drag=false;};
  const wheel=e=>{e.preventDefault();stateRef.current.distance=Math.max(6,Math.min(15,stateRef.current.distance+e.deltaY*.008));};
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('wheel',wheel,{passive:false});
  return()=>{cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('wheel',wheel);Object.values(buffers).forEach(b=>gl.deleteBuffer(b.buffer));gl.deleteProgram(program);};
 },[]);
 return <div className="sim-3d-stage"><canvas ref={canvasRef} aria-label="Interactive 3D animated cutaway vehicle. Drag to rotate and use the wheel or pinch to zoom."/><div className="sim-3d-badge">REAL-TIME 3D · DRAG TO ROTATE</div><div className="sim-3d-hint">Schematic 3D teaching model · select a system below to highlight it</div><div className="sim-3d-part-picks">{order.map(id=><button type="button" key={id} className={selected===id?'active':''} onClick={()=>onSelect(id)}>{components[id].name}</button>)}</div></div>;
}

export default function VehicleStartSimulation(){
 const [phase,setPhase]=useState(0),[selected,setSelected]=useState('battery'),[playing,setPlaying]=useState(false);
 const current=phases[phase],part=components[selected];
 useEffect(()=>{if(!playing)return undefined;const timer=window.setInterval(()=>setPhase(p=>{if(p>=phases.length-1){setPlaying(false);return p;}return p+1;}),4200);return()=>window.clearInterval(timer);},[playing]);
 const choosePhase=index=>{setPhase(index);setPlaying(false);};
 return <section className="start-sim" aria-label="Interactive whole-vehicle starting simulation">
  <div className="start-sim-heading"><div><span className="eyebrow">WHOLE-VEHICLE OPERATION SIMULATOR</span><h2>Watch the car wake up and start</h2><p>Follow electrical power, fuel delivery, engine rotation, combustion and supporting systems. Select any component to inspect its movement and job.</p></div><span className="sim-tag">Interactive · real-time 3D</span></div>
  <div className="sim-phase-strip">{phases.map((p,i)=><button type="button" key={p.id} className={phase===i?'active':''} onClick={()=>choosePhase(i)}><span>{i+1}</span><b>{p.title.split(' · ')[1]}</b></button>)}</div>
  <div className="sim-3d-shell"><div className="sim-3d-status"><span className={phase===4?'running-dot':phase===0?'off-dot':'working-dot'}></span><b>{current.short}</b><small>{phase===0?'IGNITION OFF':phase===1?'IGNITION ON':phase===2?'STARTER ENGAGED':phase===3?'COMBUSTION STARTED':'ENGINE AT IDLE'}</small></div><ThreeDStartScene phase={phase} selected={selected} onSelect={setSelected}/><div className="sim-3d-legend"><span><i className="key-electric"/>Electrical</span><span><i className="key-fuel"/>Fuel</span><span><i className="key-oil"/>Oil / coolant</span><span><i className="key-exhaust"/>Exhaust</span></div></div>
  <div className="sim-controls"><button type="button" className="secondary" onClick={()=>{setPhase(0);setPlaying(false);}}>Reset</button><button type="button" className="primary" onClick={()=>{if(phase===4)setPhase(0);setPlaying(v=>!v);}}>{playing?'Pause sequence':phase===4?'Replay start sequence':'▶ Play start sequence'}</button><button type="button" className="secondary" disabled={phase===0} onClick={()=>choosePhase(Math.max(0,phase-1))}>← Previous</button><button type="button" className="secondary" disabled={phase===4} onClick={()=>choosePhase(Math.min(4,phase+1))}>Next →</button></div>
  <article className="sim-explanation"><div><span className="eyebrow">CURRENT OPERATING STAGE</span><h3>{current.title}</h3><p>{current.detail}</p></div><div className="sim-active-list"><b>Active systems in this stage</b><p>{current.active.length?current.active.map(id=>components[id]?.name).join(' · '):'No active engine movement. Standby electrical circuits only.'}</p></div></article>
  <div className="sim-part-index"><div className="section-title"><div><h3>Inspect a component</h3><p>Select a system to highlight it in the 3D model and read its workshop notes.</p></div></div><div className="sim-part-buttons">{order.map(id=><button type="button" key={id} className={selected===id?'selected':''} onClick={()=>setSelected(id)}>{components[id].name}</button>)}</div>
   <article className="sim-component-card"><div><span className="eyebrow">WORKSHOP / LOCAL NAME</span><h3>{part.name}</h3><b>{part.local}</b></div><div><b>Position in vehicle</b><p>{part.where}</p></div><div><b>What it does</b><p>{part.what}</p></div><div><b>What you see happening</b><p>{part.motion}</p></div><div><b>If faulty</b><p>{part.fault}</p></div></article>
  </div>
  <p className="sim-disclaimer">This is a lightweight, schematic 3D teaching model, not a dimensionally accurate Kia Sportage G4NA model or a live vehicle display. The vehicle body and systems are simplified to explain relative layout and operation. Exact component positions and starting strategy vary by engine, model year and market. Never touch moving belts, fans or rotating parts on a real running engine.</p>
 </section>;
}
