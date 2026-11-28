// 3D models are streamed from Sketchfab. To swap one, replace its id
// (the 32-character code at the end of the model's Sketchfab URL).
const m = (id, title, author, note = '') => ({ id, title, author, note });

export const vehicleViews = {
  exterior: [m('89cc320440ef47c289c8b4f04ffee008', 'Kia Sportage GT-Line QL', 'Merc_TV')],
  engine: [
    m('448e9e6fdd0c469ba14573f1a35c2ee0', 'Four-cylinder engine (lighter)', 'devkrsm', 'Generic engine, not the Kia G4NA.'),
    m('be81c8572c8842a4b90e3f42e68e3e27', 'Four-cylinder engine (detailed, heavy)', '3DHorse', 'Nissan Altima hybrid engine, not the Kia G4NA. Large download.')
  ],
  suspension: [
    m('bd202ee134454402bf398ca906c8e2f5', 'MacPherson strut', 'vr.designer_09', 'Generic strut assembly.'),
    m('108faf69976747c09a21968727a13255', 'Chassis and suspension', 'UnforgettableName', 'Rear-wheel-drive chassis, shown to teach layout. The reference Sportage is front-wheel drive.')
  ]
};

// Keys match the part ids in data.js. A part with no entry shows a "no model yet" card.
export const partModels = {
  battery: m('68c36c21b1be4fdb830b534187b48f92', 'Car battery', 'ScanMe'),
  alternator: m('ad837b7fbdae422ba51b6e2cc9b9a8ba', 'Alternator', '3DHorse'),
  airfilter: m('8abb290ca65a4d26bef88dabf85a6e82', 'Air filter housing', 'rilot', 'From a Ford Mustang. Shape differs on the Sportage.'),
  radiator: m('7694147996f54ee28d58d81566440b8e', 'Car radiator', 'flow3d'),
  brakefluid: m('25afdf34c7eb4ad2ba90c5873d3a2804', 'Brake fluid reservoir', 'Sanguine3DX', 'Race-car style reservoir.'),
  starter: m('7d7e1fecacaf4751945de538b8c1378f', 'Starter motor', 'menarzuw', 'Large download.'),
  brakecaliper: m('681af6cc07b942ab848bd13fb8d6536d', 'Brake disc and caliper', 'AivisAstics'),
  shock: m('92e61757780840a683abdd38c4e8a700', 'Coilover shock absorber', 'rprispil'),
  controlarm: m('4409fdf3305e44f7b9a36b4ae8de6bba', 'Lower control arm', 'UnforgettableName'),
  driveshaft: m('82c540f28eca47adba0575b07bd9f022', 'Drive shaft', 'CompozipStudios', 'May not show the CV joints of a front axle.'),
  exhaust: m('1d4a3ca4e4a14cb394d5a49ca4e33fc2', 'Full exhaust system', 'nemo81'),
  fuelpump: m('721de0fd8bb84404a7650b679f6b9341', 'Fuel pump', 'Matteo.De.Carolis')
};
