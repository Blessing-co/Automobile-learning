import React, { useState } from 'react';

export default function ModelViewer({ model, compact = false }) {
  const [failed, setFailed] = useState(false);
  if (!model) return <div className="viewer viewer-empty">No suitable 3D model has been sourced for this component yet.</div>;
  const page = `https://sketchfab.com/models/${model.id}`;
  const src = `https://sketchfab.com/models/${model.id}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_help=0&ui_settings=0&ui_watermark=1&ui_watermark_link=1&ui_animations=1`;
  return <section className={`viewer ${compact?'viewer-compact':''}`}>
    <div className="model-heading"><div><b>{model.title}</b><small>3D model by {model.author}</small></div><a href={page} target="_blank" rel="noreferrer">Open model ↗</a></div>
    {!failed ? <div className="viewer-stage"><iframe key={model.id} title={model.title} src={src} loading="lazy" allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onError={()=>setFailed(true)}/></div> : <div className="viewer-empty">The 3D provider could not be loaded. Check your connection or open the model directly above.</div>}
    <p className="viewer-note">Drag to rotate · pinch or scroll to zoom. {model.note}</p>
  </section>;
}
