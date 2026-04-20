const stack = document.querySelector('.stack');
let prev = null, rotX = -15, rotY = -25;

stack.style.cursor = 'grab';

stack.addEventListener('pointerdown', e => {
  prev = e;
  stack.setPointerCapture(e.pointerId);
  stack.style.cursor = 'grabbing';
});

stack.addEventListener('pointermove', e => {
  if (!prev) return;
  rotY += (e.clientX - prev.clientX) * 0.4;
  rotX -= (e.clientY - prev.clientY) * 0.4;
  prev = e;
  stack.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
});

stack.addEventListener('pointerup', () => {
  prev = null;
  stack.style.cursor = 'grab';
});
