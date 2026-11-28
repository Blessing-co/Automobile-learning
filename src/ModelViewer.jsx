import React from 'react';

function TechnicalIllustration({ kind }) {
  if (kind === 'vehicle') return <svg viewBox="0 0 640 330" role="img" aria-label="Simplified side-view vehicle technical illustration">
    <path d="M82 210 L112 162 Q130 143 177 136 L235 84 Q258 65 302 65 H425 Q459 66 482 104 L530 155 Q558 164 574 190 L580 226 H62 Z" fill="#263e58" stroke="#91b7dc" strokeWidth="5"/>
    <path d="M250 91 H421 Q444 93 458 119 L483 151 H207 Z" fill="#9fc9e7" fillOpacity=".22" stroke="#91b7dc" strokeWidth="3"/>
    <path d="M194 157 H492 M320 90 V155" stroke="#91b7dc" strokeWidth="3"/>
    <circle cx="170" cy="225" r="42" fill="#101827" stroke="#91b7dc" strokeWidth="7"/><circle cx="170" cy="225" r="17" fill="#8da8c2"/>
    <circle cx="478" cy="225" r="42" fill="#101827" stroke="#91b7dc" strokeWidth="7"/><circle cx="478" cy="225" r="17" fill="#8da8c2"/>
    <path d="M75 190 H111 M548 180 H573" stroke="#f0bd65" strokeWidth="8" strokeLinecap="round"/>
    <text x="320" y="294" fill="#c8d8e8" fontSize="17" textAnchor="middle">VEHICLE BODY · SIDE VIEW</text>
  </svg>;
  if (kind === 'suspension') return <svg viewBox="0 0 640 330" role="img" aria-label="Simplified suspension assembly diagram">
    <path d="M310 38 L310 112 M330 38 L330 112" stroke="#9db9d5" strokeWidth="13" strokeLinecap="round"/>
    <path d="M275 112 L365 112 L345 245 L295 245 Z" fill="#324e6b" stroke="#9db9d5" strokeWidth="4"/>
    <path d="M280 125 L360 142 L280 159 L360 176 L280 193 L360 210" fill="none" stroke="#e7b66c" strokeWidth="8"/>
    <path d="M320 240 L210 278 L110 278 M320 240 L430 278 L530 278" stroke="#9db9d5" strokeWidth="15" strokeLinecap="round"/>
    <circle cx="320" cy="242" r="17" fill="#e7b66c" stroke="#9db9d5" strokeWidth="4"/>
    <text x="320" y="314" fill="#c8d8e8" fontSize="17" textAnchor="middle">STRUT · SPRING · CONTROL ARM</text>
  </svg>;
  if (kind === 'engine') return <svg viewBox="0 0 640 330" role="img" aria-label="Simplified engine assembly diagram">
    <path d="M170 90 H470 V250 H170 Z" fill="#314d69" stroke="#9db9d5" strokeWidth="5"/>
    <path d="M200 63 H440 V91 H200 Z" fill="#718ba6" stroke="#b8cce0" strokeWidth="4"/>
    {[235,320,405].map(x=><g key={x}><rect x={x-23} y="105" width="46" height="88" rx="8" fill="#16283c" stroke="#b8cce0" strokeWidth="4"/><rect x={x-18} y="137" width="36" height="25" rx="4" fill="#e8b76d"/><path d={`M${x} 162 L${x+12} 216`} stroke="#d1dce8" strokeWidth="9" strokeLinecap="round"/></g>)}
    <path d="M170 250 H470 M195 263 H445" stroke="#9db9d5" strokeWidth="8"/>
    <circle cx="320" cy="248" r="24" fill="#e8b76d" stroke="#b8cce0" strokeWidth="5"/>
    <text x="320" y="307" fill="#c8d8e8" fontSize="17" textAnchor="middle">FOUR-CYLINDER ENGINE · SCHEMATIC</text>
  </svg>;
  return <svg viewBox="0 0 640 330" role="img" aria-label="Simplified mechanical component diagram">
    <rect x="190" y="90" width="260" height="150" rx="18" fill="#314d69" stroke="#9db9d5" strokeWidth="5"/>
    <circle cx="320" cy="165" r="62" fill="#16283c" stroke="#e8b76d" strokeWidth="10"/>
    <circle cx="320" cy="165" r="22" fill="#9db9d5"/>
    <path d="M320 103 V55 M320 227 V275 M258 165 H210 M382 165 H430" stroke="#9db9d5" strokeWidth="8" strokeLinecap="round"/>
    <text x="320" y="310" fill="#c8d8e8" fontSize="17" textAnchor="middle">MECHANICAL COMPONENT · SCHEMATIC</text>
  </svg>;
}

export default function ModelViewer({ model, compact = false }) {
  if (!model) return <div className="viewer viewer-empty">No suitable model has been sourced for this component yet.</div>;

  const title = model.title || 'Automotive component';
  const text = `${title} ${model.note || ''}`.toLowerCase();
  const kind = /sportage|vehicle|car|exterior|chassis/.test(text)
    ? 'vehicle'
    : /suspension|strut|shock|control arm/.test(text)
      ? 'suspension'
      : /engine|piston|crank|cylinder/.test(text)
        ? 'engine'
        : 'component';
  const page = model.id ? `https://sketchfab.com/models/${model.id}` : null;

  return <section className={`viewer low-data-viewer ${compact ? 'viewer-compact' : ''}`}>
    <div className="model-heading">
      <div><b>{title}</b><small>Lightweight built-in study illustration</small></div>
      <span className="low-data-label">LOW DATA</span>
    </div>
    <div className={`low-data-stage low-data-${kind}`}>
      <TechnicalIllustration kind={kind}/>
    </div>
    <div className="low-data-explanation">
      <b>Data-saving view</b>
      <p>This technical illustration is drawn by AutoLab. It does not load a remote 3D viewer or download a large 3D model.</p>
      {model.note && <small>{model.note}</small>}
    </div>
    {page && <div className="viewer-data-controls">
      <span>Original interactive 3D is hosted externally and may use substantial data.</span>
      <a href={page} target="_blank" rel="noreferrer">Open external 3D model ↗</a>
    </div>}
    <p className="viewer-note">Schematic for learning; not a dimensionally accurate CAD model or verified Kia assembly.</p>
  </section>;
}
