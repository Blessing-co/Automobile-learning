import React, { useState } from 'react';

const components = {
  piston: {
    name: 'Piston',
    function: 'Receives force from expanding combustion gases and moves up and down inside the cylinder.',
    position: 'Inside the cylinder bore, connected to the small end of the connecting rod by the piston pin.',
    fault: 'Worn rings, scuffing, a damaged skirt or a cracked piston can cause blow-by, oil consumption, noise and loss of compression.'
  },
  rod: {
    name: 'Connecting rod',
    function: 'Transfers force between the piston and the crankshaft while changing angle during each revolution.',
    position: 'Between the piston pin and the crankshaft crankpin.',
    fault: 'Bearing wear or a bent rod can cause knocking, low oil pressure, vibration or severe engine damage.'
  },
  crank: {
    name: 'Crankshaft',
    function: 'Converts the pistons’ reciprocating movement into rotating output torque.',
    position: 'At the bottom of the engine block, supported by main bearings.',
    fault: 'Worn journals, damaged bearings or imbalance can cause deep knocking, vibration and low oil pressure.'
  },
  block: {
    name: 'Cylinder block',
    function: 'Provides the cylinder bores and structural support for the crankshaft and other major engine parts.',
    position: 'The main engine structure, below the cylinder head.',
    fault: 'Cracks, bore wear or distortion can cause coolant/oil leaks, overheating, poor compression or excessive oil consumption.'
  },
  valves: {
    name: 'Intake and exhaust valves',
    function: 'Open and close at the correct time to admit fresh charge and release exhaust gases.',
    position: 'In the cylinder head above the combustion chamber.',
    fault: 'Leaking, burnt or incorrectly timed valves can cause misfires, low compression, rough running and power loss.'
  }
};

const phases = [
  { id: 'intake', title: '1 · Intake', detail: 'The intake valve opens. The piston travels down and draws the air-fuel charge into the cylinder. The exhaust valve remains closed.' },
  { id: 'compression', title: '2 · Compression', detail: 'Both valves are closed. The piston travels up and compresses the charge before ignition.' },
  { id: 'power', title: '3 · Power', detail: 'Both valves are closed. Combustion raises cylinder pressure and pushes the piston down, turning the crankshaft.' },
  { id: 'exhaust', title: '4 · Exhaust', detail: 'The exhaust valve opens. The piston travels up and pushes burnt gases out of the cylinder.' }
];

export default function EngineMechanism({ mode = 'running' }) {
  const [exploded, setExploded] = useState(mode === 'exploded' || mode === 'disassembled');
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState(mode === 'exploded' || mode === 'disassembled' ? 'power' : 'intake');
  const [selected, setSelected] = useState('piston');
  const current = phases.find(item => item.id === phase) || phases[0];
  const item = components[selected];

  return (
    <section className="mechanism-lab" aria-labelledby="mechanism-title">
      <div className="mechanism-heading">
        <div>
          <span className="eyebrow">BUILT-IN INTERACTIVE STUDY</span>
          <h2 id="mechanism-title">Engine mechanism explorer</h2>
          <p>Explore the relationship between the piston, connecting rod, crankshaft and valves.</p>
        </div>
        <span className="mechanism-tag">2D technical schematic</span>
      </div>

      <div className="mechanism-toolbar">
        <button type="button" className={exploded ? 'selected' : ''} aria-pressed={exploded} onClick={() => setExploded(value => !value)}>
          {exploded ? 'Reassemble parts' : 'Separate parts'}
        </button>
        <button type="button" className={playing ? 'selected' : ''} aria-pressed={playing} onClick={() => setPlaying(value => !value)}>
          {playing ? 'Pause piston motion' : 'Animate piston'}
        </button>
        <span>{exploded ? 'Separated schematic' : 'Assembled schematic'} · not to scale</span>
      </div>

      <div className={`mechanism-canvas ${exploded ? 'is-exploded' : ''} ${playing ? 'is-playing' : ''}`}>
        <svg viewBox="0 0 720 390" role="img" aria-label="Simplified single-cylinder engine cross-section showing cylinder head, valves, piston, connecting rod and crankshaft">
          <defs>
            <linearGradient id="metal" x1="0" x2="1"><stop offset="0" stopColor="#8296ad"/><stop offset=".5" stopColor="#d4deea"/><stop offset="1" stopColor="#71869e"/></linearGradient>
            <linearGradient id="pistonMetal" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f4c36b"/><stop offset="1" stopColor="#c9822c"/></linearGradient>
          </defs>
          <g className="diagram-grid">
            {Array.from({ length: 13 }, (_, i) => <line key={'v'+i} x1={30+i*55} y1="18" x2={30+i*55} y2="370"/>)}
            {Array.from({ length: 7 }, (_, i) => <line key={'h'+i} x1="25" y1={35+i*55} x2="695" y2={35+i*55}/>)}
          </g>
          <g className="head-part">
            <path d="M245 65 H475 V112 H245 Z" fill="url(#metal)" stroke="#52677e" strokeWidth="3"/>
            <path d="M265 112 H455" stroke="#52677e" strokeWidth="7"/>
            <text x="360" y="47" textAnchor="middle">CYLINDER HEAD</text>
          </g>
          <g className="valve-parts">
            <path d="M305 69 L305 133 M415 69 L415 133" stroke="#e5edf5" strokeWidth="9" strokeLinecap="round"/>
            <path d="M291 135 Q305 147 319 135 M401 135 Q415 147 429 135" fill="none" stroke="#f1a64c" strokeWidth="5"/>
            <text x="255" y="160">INTAKE</text><text x="430" y="160">EXHAUST</text>
          </g>
          <g className="block-part">
            <path d="M265 115 H455 V292 H265 Z" fill="#5b7189" fillOpacity=".2" stroke="#7d91a7" strokeWidth="8"/>
            <path d="M294 116 V270 H426 V116" fill="none" stroke="#a8b8c9" strokeWidth="4"/>
            <path d="M245 292 H475 V323 H245 Z" fill="url(#metal)" stroke="#52677e" strokeWidth="3"/>
            <text x="360" y="350" textAnchor="middle">CYLINDER BLOCK / CRANKCASE</text>
          </g>
          <g className="piston-part">
            <g className="piston-moving">
              <rect x="300" y="178" width="120" height="34" rx="5" fill="url(#pistonMetal)" stroke="#9a6425" strokeWidth="3"/>
              <path d="M303 187 H417 M303 195 H417" stroke="#6c4b2b" strokeWidth="3"/>
              <path d="M310 212 H410 L400 237 H320 Z" fill="#c9822c" stroke="#9a6425" strokeWidth="3"/>
              <circle cx="360" cy="224" r="8" fill="#34475b"/>
            </g>
            <text x="485" y="205">PISTON + RINGS</text>
            <path d="M425 198 L475 198" stroke="#d5a14e" strokeWidth="2"/>
          </g>
          <g className="rod-part">
            <path d="M360 228 L397 300" stroke="#d4deea" strokeWidth="18" strokeLinecap="round"/>
            <path d="M360 228 L397 300" stroke="#71869e" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="360" cy="228" r="11" fill="#b9c7d6" stroke="#52677e" strokeWidth="3"/>
            <circle cx="397" cy="300" r="15" fill="#b9c7d6" stroke="#52677e" strokeWidth="4"/>
            <text x="475" y="270">CONNECTING ROD</text>
            <path d="M408 282 L463 272" stroke="#aebed0" strokeWidth="2"/>
          </g>
          <g className="crank-part">
            <circle cx="360" cy="310" r="43" fill="none" stroke="#8296ad" strokeWidth="13"/>
            <circle cx="360" cy="310" r="13" fill="#d7e1eb" stroke="#52677e" strokeWidth="4"/>
            <path d="M360 310 L397 300" stroke="#d5a14e" strokeWidth="12" strokeLinecap="round"/>
            <circle cx="397" cy="300" r="8" fill="#34475b"/>
            <text x="95" y="310">CRANKSHAFT</text>
            <path d="M195 305 L312 310" stroke="#aebed0" strokeWidth="2"/>
          </g>
          <text x="360" y="382" textAnchor="middle" className="diagram-caption">Simplified single-cylinder teaching model · not a Kia-specific drawing</text>
        </svg>
      </div>

      <div className="phase-controls" aria-label="Four-stroke cycle">
        {phases.map(value => <button type="button" key={value.id} className={phase === value.id ? 'selected' : ''} aria-pressed={phase === value.id} onClick={() => setPhase(value.id)}>{value.title}</button>)}
      </div>
      <div className="phase-explanation"><b>{current.title}</b><p>{current.detail}</p></div>

      <div className="component-selector">
        <div className="component-buttons">
          {Object.entries(components).map(([id, value]) => <button type="button" key={id} className={selected === id ? 'selected' : ''} aria-pressed={selected === id} onClick={() => setSelected(id)}>{value.name}</button>)}
        </div>
        <article className="component-explanation">
          <h3>{item.name}</h3>
          <div><b>Function</b><p>{item.function}</p></div>
          <div><b>Position</b><p>{item.position}</p></div>
          <div><b>When faulty</b><p>{item.fault}</p></div>
        </article>
      </div>
      <p className="mechanism-disclaimer">This is an original simplified 2D teaching schematic, not a dimensionally accurate CAD model. It does not represent the exact Kia Sportage G4NA engine. Use Kia service information for actual repair procedures, timing data and specifications.</p>
    </section>
  );
}
