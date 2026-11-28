import React, { useState } from 'react';
import ModelViewer from './ModelViewer.jsx';
import { vehicleViews, operationModels } from './models.js';

const phases = [
  { title: '1 · Key OFF', short: 'Vehicle asleep', detail: 'The engine is stopped. The crankshaft, pistons, camshafts, oil pump and alternator are stationary. The battery supplies only standby loads.', active: [] },
  { title: '2 · Ignition ON', short: 'Systems wake up', detail: 'The battery powers the control modules and instrument cluster. The ECU performs checks; the electric fuel pump may prime briefly. Warning lamps illuminate for their self-check.', active: ['Battery', 'ECU', 'Fuel pump'] },
  { title: '3 · Cranking', short: 'Starter turns engine', detail: 'The starter solenoid engages the ring gear. The starter motor turns the flywheel and crankshaft. Pistons and camshafts move; the ECU reads crankshaft and camshaft signals.', active: ['Battery', 'Starter', 'Crankshaft', 'Pistons', 'Valves', 'ECU', 'Fuel system', 'Oil pump'] },
  { title: '4 · First combustion', short: 'Engine catches', detail: 'With valid sensor signals, the ECU commands injector pulses and ignition spark. Combustion pushes the pistons down and the crankshaft accelerates. The starter disengages as the engine runs.', active: ['Crankshaft', 'Pistons', 'Valves', 'ECU', 'Injectors', 'Ignition', 'Oil system', 'Exhaust'] },
  { title: '5 · Stable idle', short: 'Engine running', detail: 'Combustion sustains rotation. The alternator generates electrical power; the oil pump circulates oil; the coolant pump circulates coolant. The ECU adjusts air, fuel and ignition to maintain idle.', active: ['Crankshaft', 'Pistons', 'Valves', 'ECU', 'Fuel system', 'Ignition', 'Oil system', 'Alternator', 'Cooling system', 'Exhaust'] }
];

const components = {
  battery: { name: 'Battery', local: 'Car battery', where: 'Engine bay or designated battery compartment', what: 'Supplies electrical energy for control modules, fuel-pump priming and the high current required by the starter.', motion: 'Electrical current flows when circuits are switched on. The battery itself has no moving external parts.', fault: 'Low charge or high internal resistance can cause dim lamps, clicking or slow/no cranking.' },
  ecu: { name: 'Engine control unit', local: 'ECU / engine computer', where: 'Engine bay or cabin, depending on vehicle', what: 'Reads sensor signals and controls fuel injection, ignition timing and other engine functions.', motion: 'Electronic control: it wakes at ignition ON, checks inputs and calculates commands during cranking and idle.', fault: 'Power, ground, wiring or sensor faults can prevent starting or cause warning lights and poor running.' },
  fuel: { name: 'Fuel pump & injectors', local: 'Fuel pump / injectors', where: 'Pump commonly in the fuel tank; injectors at the intake ports or cylinder head', what: 'Delivers fuel at the pressure and quantity required by the engine.', motion: 'The electric pump may prime at ignition ON. During cranking/running, injectors pulse when commanded by the ECU.', fault: 'Low pressure, blocked filter, poor supply or injector faults can cause long cranking, misfire or no-start.' },
  starter: { name: 'Starter motor & solenoid', local: 'Starter / starter relay', where: 'Bolted to the engine or transmission bellhousing near the flywheel', what: 'Uses battery power to rotate the engine until combustion becomes self-sustaining.', motion: 'The solenoid pushes the pinion into the flywheel ring gear; the motor spins the crankshaft. It disengages after the engine catches.', fault: 'Clicking, slow cranking, grinding or no crank. Test battery, cables and voltage drop before condemning it.' },
  crank: { name: 'Crankshaft & flywheel', local: 'Crank / flywheel', where: 'Lower engine block; flywheel at the transmission end', what: 'The crankshaft converts piston movement into rotation. The flywheel smooths rotation and provides the starter ring gear.', motion: 'The starter rotates it during cranking; combustion keeps it rotating after the engine fires.', fault: 'Bearing wear or damage may cause deep knocking, vibration, low oil pressure or failure to rotate.' },
  pistons: { name: 'Pistons & connecting rods', local: 'Pistons / con-rods', where: 'Inside the engine cylinders, above the crankshaft', what: 'Pistons receive combustion force; connecting rods transfer that force to the crankshaft.', motion: 'All pistons reciprocate up and down. Their strokes are offset so the engine delivers smoother torque.', fault: 'Wear or damage can cause low compression, oil consumption, smoke, knocking or misfire.' },
  valves: { name: 'Camshaft & valves', local: 'Cam / intake and exhaust valves', where: 'Cylinder head, above the combustion chambers', what: 'Controls when fresh air enters and exhaust gases leave each cylinder.', motion: 'The camshaft rotates in time with the crankshaft. Valves open and close in the correct sequence.', fault: 'Incorrect timing or poor sealing can cause hard starting, misfire, low compression or serious engine damage.' },
  spark: { name: 'Ignition system', local: 'Spark plugs / ignition coils', where: 'At the top of each petrol-engine cylinder', what: 'Ignites the compressed air-fuel mixture in a petrol engine.', motion: 'The ECU triggers ignition coils at the correct crank angle. Spark occurs near the end of compression.', fault: 'Worn plugs or failed coils can cause misfire, rough idle, poor power and increased fuel use.' },
  oil: { name: 'Lubrication system', local: 'Oil pump / oil galleries', where: 'Oil pump and pickup in lower engine; galleries through the block and head', what: 'Delivers pressurised engine oil to bearings and moving surfaces to reduce friction and carry heat.', motion: 'The pump is driven by the engine. Pressure builds as the crankshaft turns; oil circulates while running.', fault: 'Low oil level, blocked pickup or low pressure can rapidly damage bearings and other moving parts.' },
  alternator: { name: 'Alternator & belt', local: 'Alternator / accessory belt', where: 'Bolted to the engine and driven by the accessory belt', what: 'Generates electrical power for vehicle systems and replenishes the battery while the engine runs.', motion: 'The crankshaft pulley drives the belt, which spins the alternator rotor after the engine starts.', fault: 'A slipping belt or alternator fault can trigger the battery lamp and lead to a discharged battery.' },
  coolant: { name: 'Cooling system', local: 'Water pump / radiator / fan', where: 'Pump on engine; radiator and fan at the front of the vehicle', what: 'Moves coolant through the engine and radiator to control operating temperature.', motion: 'The pump circulates coolant as the engine runs. The thermostat regulates radiator flow; the fan operates when needed.', fault: 'Leaks, poor circulation or fan faults can cause overheating. Never open a hot cooling system.' },
  exhaust: { name: 'Exhaust system', local: 'Exhaust manifold / catalytic converter / silencer', where: 'From cylinder head, underneath vehicle, to rear outlet', what: 'Carries burnt gases away and reduces emissions and noise.', motion: 'Exhaust gases leave each cylinder when the exhaust valve opens and flow through the exhaust system.', fault: 'Leaks, blockages or damaged supports can cause noise, fumes, poor performance or unsafe exhaust entry.' }
};
const order = ['battery','ecu','fuel','starter','crank','pistons','valves','spark','oil','alternator','coolant','exhaust'];

export default function VehicleStartSimulation() {
  const [phase, setPhase] = useState(0);
  const [selected, setSelected] = useState('battery');
  const [modelView, setModelView] = useState('vehicle');
  const current = phases[phase];
  const part = components[selected];
  const model = modelView === 'vehicle' ? vehicleViews.exterior[0] : operationModels.running;

  return <section className="start-sim" aria-label="Interactive vehicle starting study">
    <div className="start-sim-heading">
      <div><span className="eyebrow">WHOLE-VEHICLE OPERATION STUDY</span><h2>Watch the car wake up and start</h2><p>Use the real 3D vehicle model for the exterior and a rigged 3D engine model to study internal movement. Follow the operating stages below.</p></div>
      <span className="sim-tag">Real 3D models · on demand</span>
    </div>

    <div className="sim-phase-strip">{phases.map((item, i) => <button type="button" key={item.title} className={phase === i ? 'active' : ''} onClick={() => setPhase(i)}><span>{i + 1}</span><b>{item.title.split(' · ')[1]}</b></button>)}</div>

    <div className="zone-tabs sim-model-tabs">
      <button type="button" className={modelView === 'vehicle' ? 'selected' : ''} onClick={() => setModelView('vehicle')}>Kia Sportage exterior</button>
      <button type="button" className={modelView === 'engine' ? 'selected' : ''} onClick={() => setModelView('engine')}>Animated 4-cylinder engine</button>
    </div>
    <ModelViewer model={model} />

    <article className="sim-explanation"><div><span className="eyebrow">CURRENT OPERATING STAGE</span><h3>{current.title}</h3><p>{current.detail}</p></div><div className="sim-active-list"><b>Systems involved at this stage</b><p>{current.active.length ? current.active.join(' · ') : 'No active engine movement. Standby electrical circuits only.'}</p></div></article>

    <div className="sim-part-index">
      <div className="section-title"><div><h3>Inspect a component</h3><p>Select a system to read its workshop function, position and fault symptoms.</p></div></div>
      <div className="sim-part-buttons">{order.map(id => <button type="button" key={id} className={selected === id ? 'selected' : ''} onClick={() => setSelected(id)}>{components[id].name}</button>)}</div>
      <article className="sim-component-card">
        <div><span className="eyebrow">WORKSHOP / LOCAL NAME</span><h3>{part.name}</h3><b>{part.local}</b></div>
        <div><b>Position in vehicle</b><p>{part.where}</p></div>
        <div><b>What it does</b><p>{part.what}</p></div>
        <div><b>What happens during starting</b><p>{part.motion}</p></div>
        <div><b>If faulty</b><p>{part.fault}</p></div>
      </article>
    </div>
    <p className="sim-disclaimer">The Kia Sportage exterior is a visual reference only. The animated four-cylinder engine is a separate generic training model, not a verified Kia Sportage G4NA engine. The stage descriptions explain the general petrol-engine starting sequence; exact component positions and starting strategy vary by engine, model year and market. Sketchfab model data is hosted by Sketchfab and is not compressed by this app. Data saver lowers texture quality only. Never touch moving belts, fans or rotating parts on a running engine.</p>
  </section>;
}
