export { createDPad };

/** @type {number} */
const REPEAT_DELAY = 350;

/** @type {number} */
const REPEAT_INTERVAL = 50;

/**
 * @typedef {Object} DPadConfigType
 * @property {!string}            label - accessible label shown above the pad. Mandatory.
 * @property {!string}            className - extra class for positioning the pad. Mandatory.
 * @property {!function(): void}  up    - called while the up button is held. Mandatory.
 * @property {!function(): void}  down  - called while the down button is held. Mandatory.
 * @property {!function(): void}  left  - called while the left button is held. Mandatory.
 * @property {!function(): void}  right - called while the right button is held. Mandatory.
 */

/**
 * Creates a directional button that fires `onPress` immediately, then
 * repeatedly while held down, so the pad can drive continuous scene
 * navigation instead of single discrete steps.
 * @param  {!string}             symbol    - the glyph shown on the button. Mandatory.
 * @param  {!string}             direction - CSS grid-area name for placement. Mandatory.
 * @param  {!function(): void}   onPress   - action to repeat while held. Mandatory.
 * @return {HTMLButtonElement}
 */
function createDPadButton(symbol, direction, onPress) {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('dpad__button', `dpad__button--${direction}`);
  button.textContent = symbol;

  /** @type {number|null} */
  let timeoutId = null;

  /** @type {number|null} */
  let intervalId = null;

  function stop() {
    if (timeoutId !== null) clearTimeout(timeoutId);
    if (intervalId !== null) clearInterval(intervalId);
    timeoutId = null;
    intervalId = null;
  }

  function start() {
    onPress();
    timeoutId = window.setTimeout(function() {
      intervalId = window.setInterval(onPress, REPEAT_INTERVAL);
    }, REPEAT_DELAY);
  }

  button.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    start();
  });
  button.addEventListener('pointerup',     stop);
  button.addEventListener('pointerleave',  stop);
  button.addEventListener('pointercancel', stop);

  return button;
}

/**
 * Creates a labelled 4-direction D-pad widget for continuous scene navigation.
 * @param  {!DPadConfigType} config - labels and per-direction handlers. Mandatory.
 * @return {HTMLElement}
 * @example
 *     document.body.appendChild(createDPad({
 *       label: 'Rotate',
 *       className: 'dpad--rotate',
 *       up:    () => scene3d.rotateByWorld({ x: STEP }),
 *       down:  () => scene3d.rotateByWorld({ x: -STEP }),
 *       left:  () => scene3d.rotateByWorld({ z: STEP }),
 *       right: () => scene3d.rotateByWorld({ z: -STEP }),
 *     }));
 */
function createDPad({ label, className, up, down, left, right }) {
  const container = document.createElement('div');
  container.classList.add('dpad', className);
  container.setAttribute('aria-label', label);

  const title = document.createElement('span');
  title.classList.add('dpad__label');
  title.textContent = label;
  container.appendChild(title);

  container.appendChild(createDPadButton('▲', 'up',    up));
  container.appendChild(createDPadButton('◀', 'left',  left));
  container.appendChild(createDPadButton('▶', 'right', right));
  container.appendChild(createDPadButton('▼', 'down',  down));

  return container;
}
