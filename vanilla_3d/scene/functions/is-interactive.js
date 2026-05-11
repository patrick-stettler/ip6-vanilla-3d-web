export {
    CUSTOM_INTERACTIVE_CLASSES,
    isInteractive
}

/** custom classes that should always block rotation or picking */
const CUSTOM_INTERACTIVE_CLASSES = {
    stopRotation: 'stop-rotation',
    interactive: 'interactive',
};

const CUSTOM_INTERACTIVE_SELECTOR = Object.values(CUSTOM_INTERACTIVE_CLASSES)
    .map(cls => `.${cls}`)
    .join(',');

/**
 * Checks whether the given element or any of its ancestors
 * should be considered interactive.
 *
 * Considers: disabled state, real links, contenteditable,
 * ARIA interactive roles, tabindex, media with controls,
 * draggable="true", custom [data-ui] flags, and ignores elements
 * hidden or disabled via CSS or ARIA.
 */
const isInteractive = node => {
    if (!(node instanceof Element)) return false;

    if (CUSTOM_INTERACTIVE_SELECTOR && node.closest(CUSTOM_INTERACTIVE_SELECTOR)) {
        return true;
    }

    // Helper: check if element is visually or interactively disabled
    const styleBlocksPointer = el => {
        const cs = getComputedStyle(el);
        return cs.pointerEvents === 'none' ||
        cs.visibility === 'hidden' ||
        cs.display === 'none';
    };

    // Native interactive selectors
    const nativeSel = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'summary',
        'label',
        'details',
        'a[href]', // only real links
        'video[controls]',
        'audio[controls]',
        '[contenteditable]:not([contenteditable="false"])',
        '[draggable="true"]',
        '[tabindex]:not([tabindex="-1"])',
        // explicit app markers
        '[data-ui]',
        '[data-no-controls]',
        'img'
    ].join(',');

    // ARIA roles that imply interactivity
    const interactiveRoles = new Set([
        'button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'textbox', 'searchbox',
        'combobox', 'menuitem', 'option', 'slider', 'spinbutton', 'treeitem'
    ]);

    const isRoleInteractive = el => {
        const role = el.getAttribute('role');
        if (!role) return false;
        if (!interactiveRoles.has(role.trim())) return false;
        // Only if focusable
        const ti = el.getAttribute('tabindex');
        return ti === null || ti === '0' || parseInt(ti, 10) >= 0;
    };

    // Elements that make a subtree non-interactive
    const inertOrHidden = el =>
        el.closest('[inert], [hidden], [aria-hidden="true"]') !== null;

    // Check for any native interactive ancestor
    const match = node.closest(nativeSel);
    if (match && !styleBlocksPointer(match) && !inertOrHidden(match)) return true;

    // Check ARIA role interactivity up the DOM path
    let el = node;
    while (el) {
        if (!styleBlocksPointer(el) && !inertOrHidden(el) && isRoleInteractive(el)) {
            return true;
        }
        el = el.parentElement || el.getRootNode && el.getRootNode().host || null;
    }

    // Images only count as interactive if draggable or linked
    const imgEl = node.closest('img');
    if (imgEl) {
        if (imgEl.draggable === true) return true;
    }

    return !!node.closest('a[href] img');


};