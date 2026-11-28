import React, { useState } from 'react';

export default function ModelViewer({ model, compact = false }) {
  const [openedModelId, setOpenedModelId] = useState(null);
  const [failedModelId, setFailedModelId] = useState(null);

  if (!model) return <div className="viewer viewer-empty">No suitable 3D model has been sourced for this component yet.</div>;

  const page = `https://sketchfab.com/models/${model.id}`;
  // Key the open state to the selected model so switching models cannot
  // briefly mount a different iframe before an effect runs.
  const loaded = openedModelId === model.id;
  const failed = failedModelId === model.id;
  // The iframe is not created until the learner explicitly opens it.
  // autostart=0 lets Sketchfab show its lightweight preview first; its own
  // Play control is the second deliberate action that starts the 3D model.
  const src = `https://sketchfab.com/models/${model.id}/embed?autostart=0&preload=0&camera=0&ui_theme=dark&ui_infos=0&ui_help=0&ui_settings=0&ui_watermark=1&ui_watermark_link=1&ui_animations=1`;

  return <section className={`viewer ${compact ? 'viewer-compact' : ''}`}>
    <div className="model-heading">
      <div><b>{model.title}</b><small>3D model by {model.author}</small></div>
      <a href={page} target="_blank" rel="noreferrer">Model details ↗</a>
    </div>

    {!loaded && !failed && <div className="viewer-gate">
      <div className="viewer-gate-icon" aria-hidden="true">3D</div>
      <b>3D model is not loaded</b>
      <p>Opening the viewer uses internet data. The model itself may require a large download, depending on its geometry and textures.</p>
      <button type="button" className="primary" onClick={() => { setFailedModelId(null); setOpenedModelId(model.id); }}>Open viewer</button>
      <small>Nothing is downloaded from Sketchfab until you choose to open the viewer. Use the Play control inside Sketchfab to start loading the model.</small>
    </div>}

    {failed && <div className="viewer-empty">
      <div>
        <p>The 3D provider could not be loaded. Check your connection or open the model directly.</p>
        <button type="button" className="secondary" onClick={() => { setFailedModelId(null); setOpenedModelId(model.id); }}>Try again</button>
      </div>
    </div>}

    {loaded && !failed && <>
      <div className="viewer-stage">
        <iframe
          key={model.id}
          title={model.title}
          src={src}
          loading="eager"
          allow="fullscreen; xr-spatial-tracking"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onError={() => setFailedModelId(model.id)}
        />
      </div>
      <div className="viewer-data-controls">
        <span>Viewer open · model loads when you press Play inside the viewer</span>
        <button type="button" onClick={() => { setOpenedModelId(null); setFailedModelId(null); }}>Close viewer</button>
      </div>
    </>}

    <p className="viewer-note">Drag to rotate · pinch or scroll to zoom. {model.note}</p>
  </section>;
}
