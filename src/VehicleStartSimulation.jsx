import React, { useEffect, useState } from 'react';

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

export default function VehicleStartSimulation(){
  const [phase,setPhase]=useState(0);
  const [selected,setSelected]=useState('battery');
  const [playing,setPlaying]=useState(false);
  const current=phases[phase];
  const part=components[selected];
  useEffect(()=>{
    if(!playing)return undefined;
    const timer=window.setInterval(()=>setPhase(p=>{if(p>=phases.length-1){setPlaying(false);return p;}return p+1;}),4200);
    return ()=>window.clearInterval(timer);
  },[playing]);
  const choosePhase=(index)=>{setPhase(index);setPlaying(false);};
  const isActive=id=>current.active.includes(id);
  return <section className="start-sim" aria-label="Interactive whole-vehicle starting simulation">
    <div className="start-sim-heading">
      <div><span className="eyebrow">WHOLE-VEHICLE OPERATION SIMULATOR</span><h2>Watch the car wake up and start</h2><p>Follow electrical power, fuel delivery, engine rotation, combustion and supporting systems. Select any component to inspect its movement and job.</p></div>
      <span className="sim-tag">Interactive · lightweight animation</span>
    </div>
    <div className="sim-phase-strip">
      {phases.map((p,i)=><button type="button" key={p.id} className={phase===i?'active':''} onClick={()=>choosePhase(i)}><span>{i+1}</span><b>{p.title.split(' · ')[1]}</b></button>)}
    </div>
    <div className={'car-cutaway phase-'+current.id}>
      <div className="sim-status"><span className={phase===4?'running-dot':phase===0?'off-dot':'working-dot'}></span><b>{current.short}</b><small>{phase===0?'IGNITION OFF':phase===1?'IGNITION ON':phase===2?'STARTER ENGAGED':phase===3?'COMBUSTION STARTED':'ENGINE AT IDLE'}</small></div>
      <svg viewBox="0 0 900 420" role="img" aria-label="Simplified animated side cutaway of a front-engine vehicle showing battery, starter, engine, fuel, cooling, alternator, exhaust and drivetrain">
        <defs>
          <linearGradient id="carGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9d8ee" stopOpacity=".8"/><stop offset="1" stopColor="#5c7895" stopOpacity=".5"/></linearGradient>
          <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#83b8e8"/><stop offset="1" stopColor="#2d6598"/></linearGradient>
        </defs>
        <path className="car-body" d="M78 254 L108 214 Q135 196 236 185 L315 104 Q344 78 399 78 H560 Q601 80 638 126 L714 184 L790 206 Q815 217 823 250 L817 291 H72 Z" fill="url(#carBody)" stroke="#b8d8f2" strokeWidth="5"/>
        <path d="M257 180 L330 111 Q350 94 399 94 H470 V180 Z M489 94 H558 Q586 98 613 132 L651 180 H489 Z" fill="url(#carGlass)" stroke="#c6e2f7" strokeWidth="4"/>
        <path d="M475 94 V181" stroke="#d8eafa" strokeWidth="4"/>
        <path d="M88 255 H814" stroke="#d8eafa" strokeWidth="4" opacity=".8"/>
        <g className="wheel wheel-rear"><circle cx="220" cy="286" r="55" fill="#172433" stroke="#b7c9d9" strokeWidth="7"/><circle cx="220" cy="286" r="29" fill="#9aafc1"/><circle cx="220" cy="286" r="9" fill="#31485d"/><path d="M220 258 V314 M192 286 H248 M200 266 L240 306 M240 266 L200 306" stroke="#42596e" strokeWidth="5"/></g>
        <g className="wheel wheel-front"><circle cx="700" cy="286" r="55" fill="#172433" stroke="#b7c9d9" strokeWidth="7"/><circle cx="700" cy="286" r="29" fill="#9aafc1"/><circle cx="700" cy="286" r="9" fill="#31485d"/><path d="M700 258 V314 M672 286 H728 M680 266 L720 306 M720 266 L680 306" stroke="#42596e" strokeWidth="5"/></g>
        <g className={'sim-part battery-part '+(selected==='battery'?'part-selected':'')} onClick={()=>setSelected('battery')} role="button" tabIndex="0" aria-label="Select battery"><rect x="111" y="210" width="72" height="34" rx="5" fill="#283d50" stroke="#e2edf7" strokeWidth="2"/><path d="M124 205 V212 M170 205 V212" stroke="#e2edf7" strokeWidth="4"/><text x="147" y="232" textAnchor="middle">12V</text><text className="svg-label" x="147" y="198" textAnchor="middle">BATTERY</text></g>
        <path className={'power-flow '+(isActive('battery')?'flow-on':'')} d="M180 222 H254 Q270 222 278 238 L310 252" />
        <g className={'sim-part ecu-part '+(selected==='ecu'?'part-selected':'')} onClick={()=>setSelected('ecu')} role="button" tabIndex="0" aria-label="Select engine control unit"><rect x="192" y="147" width="55" height="27" rx="4" fill="#314e69" stroke="#9bc7ed" strokeWidth="2"/><text x="219" y="165" textAnchor="middle">ECU</text></g>
        <path className={'signal-flow '+(isActive('ecu')?'flow-on':'')} d="M220 175 L240 205 L300 205"/>
        <g className={'engine-assembly '+(isActive('crank')||isActive('pistons')?'engine-moving':'')}>
          <rect x="300" y="203" width="185" height="78" rx="10" fill="#586e82" stroke="#d1e0ed" strokeWidth="4"/>
          <rect x="318" y="177" width="151" height="32" rx="5" fill="#a9bac9" stroke="#dbe7f1" strokeWidth="3"/>
          <g className="piston-unit"><rect x="332" y="184" width="26" height="28" rx="3" fill="#e6b86e" stroke="#6e5636" strokeWidth="2"/><path d="M345 211 L365 252" stroke="#d7e2eb" strokeWidth="8"/><circle cx="365" cy="252" r="7" fill="#f0c77c"/></g>
          <g className="piston-unit piston-two"><rect x="373" y="184" width="26" height="28" rx="3" fill="#e6b86e" stroke="#6e5636" strokeWidth="2"/><path d="M386 211 L397 252" stroke="#d7e2eb" strokeWidth="8"/><circle cx="397" cy="252" r="7" fill="#f0c77c"/></g>
          <path d="M310 214 H475 M310 222 H475" stroke="#243a4e" strokeWidth="3"/>
          <g className="crank-unit"><circle cx="386" cy="253" r="21" fill="none" stroke="#e5edf5" strokeWidth="7"/><circle cx="386" cy="253" r="7" fill="#f2c879"/><path d="M386 253 L405 239" stroke="#f2c879" strokeWidth="8"/></g>
          <text x="392" y="298" textAnchor="middle" className="svg-label">ENGINE BLOCK</text>
        </g>
        <g className={'sim-part starter-part '+(selected==='starter'?'part-selected':'')} onClick={()=>setSelected('starter')} role="button" tabIndex="0" aria-label="Select starter motor"><rect x="270" y="263" width="44" height="24" rx="9" fill="#647f98" stroke="#e0eaf3" strokeWidth="2"/><path d="M313 270 L327 270" stroke="#e5c17d" strokeWidth="5"/><text x="291" y="315" textAnchor="middle" className="svg-label">STARTER</text></g>
        <g className={'sim-part fuel-part '+(selected==='fuel'?'part-selected':'')} onClick={()=>setSelected('fuel')} role="button" tabIndex="0" aria-label="Select fuel system"><path d="M570 225 H520 L478 190" fill="none" stroke="#e6ae55" strokeWidth="5" strokeDasharray="7 5"/><rect x="558" y="207" width="46" height="32" rx="5" fill="#77552d" stroke="#ffd48c" strokeWidth="2"/><text x="581" y="227" textAnchor="middle" fill="#fff">FUEL</text><text x="570" y="253" textAnchor="middle" className="svg-label">PUMP / INJECTORS</text></g>
        <path className={'fuel-flow '+(isActive('fuel')?'flow-on':'')} d="M570 220 H520 L478 190"/>
        <g className={'sim-part spark-part '+(selected==='spark'?'part-selected':'')} onClick={()=>setSelected('spark')} role="button" tabIndex="0" aria-label="Select ignition system"><path d="M345 168 V180 M386 168 V180 M427 168 V180" stroke="#f8d56a" strokeWidth="5"/><path className="spark-flash" d="M345 158 l-8 10 9 0 -5 11 14 -16 -9 0 5 -5" fill="#ffe26c"/><text x="388" y="150" textAnchor="middle" className="svg-label">SPARK PLUGS / COILS</text></g>
        <g className={'sim-part alternator-part '+(selected==='alternator'?'part-selected':'')} onClick={()=>setSelected('alternator')} role="button" tabIndex="0" aria-label="Select alternator"><circle cx="480" cy="258" r="19" fill="#536d85" stroke="#e0ebf5" strokeWidth="4"/><circle cx="480" cy="258" r="7" fill="#c9d7e5"/><text x="480" y="289" textAnchor="middle" className="svg-label">ALT</text></g>
        <path className={'belt-path '+(isActive('alternator')?'belt-on':'')} d="M405 239 Q440 218 480 239 Q503 258 480 277 Q445 292 405 267" />
        <g className={'sim-part oil-part '+(selected==='oil'?'part-selected':'')} onClick={()=>setSelected('oil')} role="button" tabIndex="0" aria-label="Select lubrication system"><path d="M329 278 Q345 293 361 278" fill="none" stroke="#e6bd54" strokeWidth="5"/><text x="345" y="326" textAnchor="middle" className="svg-label">OIL PUMP</text></g>
        <path className={'oil-flow '+(isActive('oil')?'flow-on':'')} d="M345 278 V235 H365 V214"/>
        <g className={'sim-part coolant-part '+(selected==='coolant'?'part-selected':'')} onClick={()=>setSelected('coolant')} role="button" tabIndex="0" aria-label="Select cooling system"><rect x="510" y="186" width="32" height="77" rx="4" fill="#315d75" stroke="#9bd7ef" strokeWidth="3"/><path d="M518 196 V251 M526 196 V251 M534 196 V251" stroke="#9bd7ef" strokeWidth="2"/><text x="526" y="280" textAnchor="middle" className="svg-label">RADIATOR</text></g>
        <path className={'coolant-flow '+(isActive('coolant')?'flow-on':'')} d="M510 195 Q490 170 455 183 L430 196"/>
        <g className={'sim-part exhaust-part '+(selected==='exhaust'?'part-selected':'')} onClick={()=>setSelected('exhaust')} role="button" tabIndex="0" aria-label="Select exhaust system"><path d="M480 199 Q530 280 620 270 H780" fill="none" stroke="#a7b3bf" strokeWidth="12" strokeLinecap="round"/><rect x="610" y="253" width="60" height="30" rx="12" fill="#687b8b" stroke="#e1e9f0" strokeWidth="3"/><text x="704" y="306" textAnchor="middle" className="svg-label">EXHAUST TO REAR</text></g>
        <path className={'exhaust-flow '+(isActive('exhaust')?'flow-on':'')} d="M485 202 Q530 280 620 270 H780"/>
        <g className="transmission"><rect x="255" y="286" width="86" height="38" rx="8" fill="#526b82" stroke="#d4e1ed" strokeWidth="3"/><text x="298" y="310" textAnchor="middle" className="svg-label">GEARBOX</text><path d="M255 305 L245 305 M341 305 L362 305" stroke="#d4e1ed" strokeWidth="5"/></g>
        <text x="450" y="380" textAnchor="middle" className="svg-foot">SIMPLIFIED TEACHING CUTAWAY · NOT TO SCALE OR A KIA FACTORY DRAWING</text>
      </svg>
      <div className="sim-key"><span><i className="key-electric"/>Electrical power</span><span><i className="key-fuel"/>Fuel</span><span><i className="key-oil"/>Oil / coolant</span><span><i className="key-exhaust"/>Exhaust gas</span></div>
    </div>
    <div className="sim-controls">
      <button type="button" className="secondary" onClick={()=>{setPhase(0);setPlaying(false);}}>Reset</button>
      <button type="button" className="primary" onClick={()=>{if(phase===phases.length-1){setPhase(0);}setPlaying(v=>!v);}}>{playing?'Pause sequence':phase===4?'Replay start sequence':'▶ Play start sequence'}</button>
      <button type="button" className="secondary" disabled={phase===0} onClick={()=>choosePhase(Math.max(0,phase-1))}>← Previous</button>
      <button type="button" className="secondary" disabled={phase===4} onClick={()=>choosePhase(Math.min(4,phase+1))}>Next →</button>
    </div>
    <article className="sim-explanation"><div><span className="eyebrow">CURRENT OPERATING STAGE</span><h3>{current.title}</h3><p>{current.detail}</p></div><div className="sim-active-list"><b>Active systems in this stage</b><p>{current.active.length?current.active.map(id=>components[id].name).join(' · '):'No active engine movement. Standby electrical circuits only.'}</p></div></article>
    <div className="sim-part-index"><div className="section-title"><div><h3>Inspect a component</h3><p>Select a part in the cutaway or use this index.</p></div></div><div className="sim-part-buttons">{order.map(id=><button type="button" key={id} className={selected===id?'selected':''} onClick={()=>setSelected(id)}>{components[id].name}</button>)}</div>
      <article className="sim-component-card"><div><span className="eyebrow">WORKSHOP / LOCAL NAME</span><h3>{part.name}</h3><b>{part.local}</b></div><div><b>Position in vehicle</b><p>{part.where}</p></div><div><b>What it does</b><p>{part.what}</p></div><div><b>What you see happening</b><p>{part.motion}</p></div><div><b>If faulty</b><p>{part.fault}</p></div></article>
    </div>
    <p className="sim-disclaimer">Learning simulation only. This is a simplified generic front-engine petrol vehicle sequence, not a live vehicle diagnostic display or a dimensionally accurate Kia Sportage G4NA model. Exact component positions and starting strategy vary by engine, model year and market. Never touch moving belts, fans or rotating parts on a real running engine.</p>
  </section>;
}
