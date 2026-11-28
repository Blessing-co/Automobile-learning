import React, { useEffect, useRef, useState } from 'react';

let sketchfabScriptPromise;
function loadSketchfabApi() {
  if (window.Sketchfab) return Promise.resolve();
  if (!sketchfabScriptPromise) {
    sketchfabScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-sketchfab-api]');
      const script = existing || document.createElement('script');
      const onReady = () => window.Sketchfab ? resolve() : reject(new Error('Sketchfab API did not initialise.'));
      script.addEventListener('load', onReady, { once: true });
      script.addEventListener('error', () => reject(new Error('Could not load the 3D viewer controls.')), { once: true });
      if (!existing) {
        script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
        script.async = true;
        script.dataset.sketchfabApi = 'true';
        document.head.appendChild(script);
      }
    }).catch(error => { sketchfabScriptPromise = null; throw error; });
  }
  return sketchfabScriptPromise;
}

const QUALITY = {
  low: { label: 'Data saver', value: 'ld', detail: 'Lowest texture resolution. Recommended on mobile data.' },
  standard: { label: 'Standard', value: 'sd', detail: 'Balanced texture detail and data use.' },
  high: { label: 'High', value: 'hd', detail: 'Highest texture detail. Uses more data.' }
};

export default function ModelViewer({ model, compact = false }) {
  const [opened, setOpened] = useState(false);
  const [quality, setQuality] = useState('low');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const iframeRef = useRef(null);
  const apiRef = useRef(null);
  const qualityRef = useRef(quality);
  qualityRef.current = quality;

  useEffect(() => () => { try { apiRef.current?.stop(); } catch {} }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (api && status === 'ready') api.setTextureQuality(QUALITY[quality].value, () => {});
  }, [quality, status]);

  useEffect(() => {
    if (!opened || !model || !iframeRef.current) return undefined;
    let cancelled = false;
    setStatus('loading');
    setError('');

    loadSketchfabApi().then(() => {
      if (cancelled || !iframeRef.current) return;
      const client = new window.Sketchfab('1.12.1', iframeRef.current);
      client.init(model.id, {
        autostart: 0,
        preload: 0,
        success: api => {
          if (cancelled) { try { api.stop(); } catch {} return; }
          apiRef.current = api;
          api.addEventListener('viewerready', () => {
            if (cancelled) return;
            api.setTextureQuality(QUALITY[qualityRef.current].value, () => {});
            setStatus('ready');
          });
          api.setTextureQuality(QUALITY[qualityRef.current].value, () => {
            if (!cancelled) api.start();
          });
        },
        error: () => {
          if (!cancelled) {
            setError('The 3D provider could not start. Check your connection or open the model directly.');
            setStatus('error');
          }
        }
      });
    }).catch(err => {
      if (!cancelled) { setError(err.message || 'The 3D viewer could not be loaded.'); setStatus('error'); }
    });

    return () => {
      cancelled = true;
      try { apiRef.current?.stop(); } catch {}
      apiRef.current = null;
    };
  }, [opened, model?.id]);

  if (!model) return <div className="viewer viewer-empty">No suitable 3D model has been sourced for this component yet.</div>;

  const page = 'https://sketchfab.com/models/' + model.id;
  const close = () => {
    try { apiRef.current?.stop(); } catch {}
    apiRef.current = null;
    setOpened(false);
    setStatus('idle');
    setError('');
  };

  return <section className={'viewer ' + (compact ? 'viewer-compact' : '')}>
    <div className="model-heading">
      <div><b>{model.title}</b><small>3D model by {model.author}</small></div>
      <a href={page} target="_blank" rel="noreferrer">Model details ↗</a>
    </div>

    {!opened && <div className="viewer-gate">
      <div className="viewer-gate-icon" aria-hidden="true">3D</div>
      <b>3D model is not loaded</b>
      <p>Choose texture quality, then open the model. Data saver reduces texture resolution. The model geometry is still hosted and sized by its publisher.</p>
      <div className="viewer-quality" role="group" aria-label="3D texture quality">
        {Object.entries(QUALITY).map(([key, item]) => <button key={key} type="button" className={quality === key ? 'selected' : ''} aria-pressed={quality === key} onClick={() => setQuality(key)}>
          <b>{item.label}</b><small>{item.detail}</small>
        </button>)}
      </div>
      <button type="button" className="primary" onClick={() => setOpened(true)}>Load 3D model</button>
      <small>No Sketchfab viewer or model is requested until you press this button. Data saver is selected by default.</small>
    </div>}

    {opened && <>
      <div className="viewer-stage">
        <iframe ref={iframeRef} title={model.title} src="" loading="eager"
          allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin" />
        {status !== 'ready' && <div className="viewer-loading" role="status">
          {status === 'error'
            ? <><p>{error}</p><button className="secondary" type="button" onClick={() => { setOpened(false); setStatus('idle'); setError(''); window.setTimeout(() => setOpened(true), 0); }}>Try again</button></>
            : <><span className="viewer-spinner"/><b>Starting 3D viewer…</b><small>Using {QUALITY[quality].label.toLowerCase()} texture quality.</small></>}
        </div>}
      </div>
      <div className="viewer-data-controls">
        <label>Texture quality
          <select value={quality} onChange={event => setQuality(event.target.value)}>
            {Object.entries(QUALITY).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
        </label>
        <span>{status === 'ready' ? '3D viewer ready · texture quality can be changed above' : 'Loading viewer controls'}</span>
        <button type="button" onClick={close}>Close viewer</button>
      </div>
    </>}

    <p className="viewer-note">Drag to rotate · pinch or scroll to zoom. {model.note}</p>
  </section>;
}
