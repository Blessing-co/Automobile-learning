import React, { useState } from 'react';

// Nothing downloads until the learner taps Load, which saves mobile data.
// Each model runs inside its own iframe, so a failed model cannot blank the app.
export default function ModelViewer({ model }) {
  const [loaded, setLoaded] = useState(null);
  if (!model) return <div className="viewer"><div className="viewer-empty">No good 3D model for this part yet. Study the profile and inspect it on a real vehicle.</div></div>;
  const page = `https://sketchfab.com/3d-models/${model.id}`;
  return (
    <div className="viewer">
      <div className="model-heading">
        <b>{model.title}</b>
        <a href={page} target="_blank" rel="noreferrer">by {model.author} ↗</a>
      </div>
      <div className="viewer-stage">
        {loaded === model.id ? (
          <iframe
            key={model.id}
            title={model.title}
            src={`https://sketchfab.com/models/${model.id}/embed?autostart=1&ui_theme=dark`}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
        ) : (
          <button className="viewer-load" onClick={() => setLoaded(model.id)}>
            <b>▶ Load 3D model</b>
            <span>Needs internet. Drag to rotate, pinch or scroll to zoom.</span>
          </button>
        )}
      </div>
      {model.note && <p className="viewer-note">{model.note}</p>}
    </div>
  );
}
