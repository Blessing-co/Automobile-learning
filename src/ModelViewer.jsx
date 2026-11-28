import React from 'react';

// Models load straight away. Each runs inside its own iframe, so a failed model cannot blank the app.
export default function ModelViewer({ model }) {
  if (!model) return <div className="viewer"><div className="viewer-empty">No good 3D model for this part yet. Study the profile and inspect it on a real vehicle.</div></div>;
  const page = `https://sketchfab.com/3d-models/${model.id}`;
  return (
    <div className="viewer">
      <div className="model-heading">
        <b>{model.title}</b>
        <a href={page} target="_blank" rel="noreferrer">by {model.author} · open full screen ↗</a>
      </div>
      <div className="viewer-stage">
        <iframe
          key={model.id}
          title={model.title}
          src={`https://sketchfab.com/models/${model.id}/embed?autostart=1&ui_theme=dark`}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
      </div>
      <p className="viewer-note">Drag to rotate, pinch or scroll to zoom. Needs internet. {model.note}</p>
    </div>
  );
}
