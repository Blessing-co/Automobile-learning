# AutoLab — Automobile Engineering Academy

A lightweight, installable, mobile-first automobile engineering learning app.

## Development
- Node.js 20.19+ or 22.12+
- `npm install`
- `npm run dev`
- `npm run build`

## Architecture
- `index.html`: application shell and metadata
- `src/index.css`: styles and layouts
- `src/App.jsx`: pages and navigation; `src/ModelViewer.jsx`: 3D viewer; `src/models.js`: which Sketchfab model each view and part uses
- `src/data.js`: component and vehicle-system learning content
- `public/`: PWA manifest, icon and offline service worker

## Learning data
Component location and fitment can vary by Sportage engine, drivetrain and market. Confirm the vehicle VIN and engine code before applying workshop procedures. 3D models are embedded from Sketchfab, need internet, and are credited to their authors in the viewer.

Progress is stored locally in the browser on the learner's device. No account or remote database is required.
