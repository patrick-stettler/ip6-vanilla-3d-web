// Slider controls
document.querySelectorAll('#controls input[data-prop]').forEach(input => {
  input.addEventListener('input', () => {
    document.documentElement.style.setProperty(`--${input.dataset.prop}`, input.value);
  });
});

let activeCube = null;
let activePlane = null;

let startX = 0;
let startY = 0;

let startTx = 0;
let startTy = 0;
let startTz = 0;

function getTransformValues(cube) {
  return {
    x: parseFloat(cube.dataset.tx || 0),
    y: parseFloat(cube.dataset.ty || 0),
    z: parseFloat(cube.dataset.tz || 0),
  };
}

function setTransformValues(cube, x, y, z) {
  cube.dataset.tx = x;
  cube.dataset.ty = y;
  cube.dataset.tz = z;

  cube.style.setProperty('--tx', `${x}px`);
  cube.style.setProperty('--ty', `${y}px`);
  cube.style.setProperty('--tz', `${z}px`);
}

// Face → Bewegungs-Plane
function getPlane(face) {
  if (
    face.classList.contains('cube_face--front') ||
    face.classList.contains('cube_face--back')
  ) {
    return 'xy';
  }

  if (
    face.classList.contains('cube_face--top') ||
    face.classList.contains('cube_face--bottom')
  ) {
    return 'xz';
  }

  if (
    face.classList.contains('cube_face--left') ||
    face.classList.contains('cube_face--right')
  ) {
    return 'yz';
  }

  return 'xy';
}

document.querySelectorAll('.cube').forEach(cube => {
  cube.addEventListener('pointerdown', (e) => {
    activeCube = cube;

    const face = e.target.closest('.cube_face');
    if (!face) return;

    activePlane = getPlane(face);

    cube.setPointerCapture(e.pointerId);

    startX = e.clientX;
    startY = e.clientY;

    const v = getTransformValues(cube);
    startTx = v.x;
    startTy = v.y;
    startTz = v.z;
  });
});

window.addEventListener('pointermove', (e) => {
  if (!activeCube) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  let x = startTx;
  let y = startTy;
  let z = startTz;

  if (activePlane === 'xy') {
    x = startTx + dx;
    y = startTy + dy;
  }

  if (activePlane === 'xz') {
    x = startTx + dx;
    z = startTz + dy;
  }

  if (activePlane === 'yz') {
    y = startTy + dy;
    z = startTz + dx;
  }

  setTransformValues(activeCube, x, y, z);
});

window.addEventListener('pointerup', () => {
  activeCube = null;
  activePlane = null;
});