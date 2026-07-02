/**
 * @module ui/DPad
 * Provides a repeating directional pad control.
 */

import { REPEAT_DELAY, REPEAT_INTERVAL } from "../config.js";

export { createDPad };

/**
 * @typedef {Object} DPadConfigType
 * @property { !string }           label     - accessible label. Mandatory.
 * @property { !string }           className - extra class for positioning. Mandatory.
 * @property { !function(): void } up        - called while the up button is held. Mandatory.
 * @property { !function(): void } down      - called while the down button is held. Mandatory.
 * @property { !function(): void } left      - called while the left button is held. Mandatory.
 * @property { !function(): void } right     - called while the right button is held. Mandatory.
 * @property { !function(): void } reset     - called when the center button is clicked. Mandatory.
 */

/**
 * Creates a directional button that repeatedly fires while held down.
 * @impure
 * @private
 * @param  { !HTMLElement }    icon      - icon shown on the button. Mandatory.
 * @param  { !string }         direction - CSS grid-area name. Mandatory.
 * @param  { !string }         label     - accessible action label. Mandatory.
 * @param  { !function(): void } onPress - action to repeat while held. Mandatory.
 * @return { HTMLButtonElement }
 */
function createDPadButton(icon, direction, label, onPress) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("dpad__button", `dpad__button--${direction}`);
    button.setAttribute("aria-label", label);
    button.title = label;
    button.appendChild(icon);

    /** @type { number | null } */
    let timeoutId = null;

    /** @type { number | null } */
    let intervalId = null;

    /**
     * Stops any pending repeat timers.
     * @impure
     * @return { void }
     */
    function stop() {
        if (timeoutId !== null) clearTimeout(timeoutId);
        if (intervalId !== null) clearInterval(intervalId);
        timeoutId = null;
        intervalId = null;
    }

    /**
     * Starts immediate and repeated button action.
     * @impure
     * @return { void }
     */
    function start() {
        onPress();
        timeoutId = window.setTimeout(function() {
            intervalId = window.setInterval(onPress, REPEAT_INTERVAL);
        }, REPEAT_DELAY);
    }

    button.addEventListener("pointerdown", function(e) {
        e.preventDefault();
        start();
    });
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointerleave", stop);
    button.addEventListener("pointercancel", stop);

    return button;
}

/**
 * Creates a D-pad icon.
 * @pure
 * @private
 * @param  { !Array<!string> } paths - SVG path data entries. Mandatory.
 * @return { SVGElement }
 */
function createIcon(paths) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    paths.forEach(function(pathData) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        svg.appendChild(path);
    });

    return svg;
}

/**
 * Creates the center reset button.
 * @impure
 * @private
 * @param  { !function(): void } onClick - action fired on click. Mandatory.
 * @return { HTMLButtonElement }
 */
function createDPadResetButton(onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("dpad__button", "dpad__button--center");
    button.setAttribute("aria-label", "Reset view");
    button.title = "Reset view";
    button.appendChild(createIcon([
        "M4 4v6h6",
        "M5.5 15a7 7 0 1 0 1.6-7.4L4 10"
    ]));

    button.addEventListener("click", function(e) {
        e.preventDefault();
        onClick();
    });

    return button;
}

/**
 * Creates a labelled four-direction D-pad widget.
 * @impure
 * @param  { !DPadConfigType } config - labels and per-direction handlers. Mandatory.
 * @return { HTMLElement }
 * @example
 *     document.body.appendChild(createDPad({
 *         label: "Rotate",
 *         className: "dpad--rotate",
 *         up: function() { scene3d.rotateByWorld({ x: 6 }); },
 *         down: function() { scene3d.rotateByWorld({ x: -6 }); },
 *         left: function() { scene3d.rotateByWorld({ z: 6 }); },
 *         right: function() { scene3d.rotateByWorld({ z: -6 }); },
 *         reset: function() { viewModeController.resetView(); }
 *     }));
 */
function createDPad({ label, className, up, down, left, right, reset }) {
    const container = document.createElement("div");
    container.classList.add("dpad", className);
    container.setAttribute("aria-label", label);

    container.appendChild(createDPadButton(createIcon([
        "M12 19V5",
        "M6 11l6-6 6 6"
    ]), "up", "Rotate +X", up));
    container.appendChild(createDPadButton(createIcon([
        "M7 7h6a5 5 0 0 1 0 10H9",
        "M7 7l4-4",
        "M7 7l4 4"
    ]), "left", "Rotate -Z", left));
    container.appendChild(createDPadResetButton(reset));
    container.appendChild(createDPadButton(createIcon([
        "M17 7h-6a5 5 0 0 0 0 10h4",
        "M17 7l-4-4",
        "M17 7l-4 4"
    ]), "right", "Rotate +Z", right));
    container.appendChild(createDPadButton(createIcon([
        "M12 5v14",
        "M6 13l6 6 6-6"
    ]), "down", "Rotate -X", down));

    return container;
}
