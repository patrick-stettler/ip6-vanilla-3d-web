import {loadCss} from "../utils/load-css.js";

export {
    applyPictureTexture
}

/**
 * Supported textures.
 * @typedef {'wood'|'stone'|'sky'|'bark'|'brick'} TextureType
 */

const TEXTURE_CLASSES = ['wood', 'stone', 'sky', 'bark', 'brick'];

/** @param {unknown} x
 * @returns {x is HTMLElement}
 */
const isEl = x => x instanceof HTMLElement;

/** @param {unknown} x
 * @returns {x is { element: HTMLElement }}
 */
const hasEl = x => x && typeof x === 'object' && 'element' in x && isEl(x.element);

/** @param {unknown} items
 * @returns {Array<HTMLElement|{element:HTMLElement}>}
 */
const normalize = items => {
    const out = [];

    const visit = x => {
        if (!x) return;

        if (isEl(x) || hasEl(x)) {
            out.push(x);
            return;
        }
        if (Array.isArray(x) || x instanceof NodeList || x instanceof HTMLCollection) {
            for (const y of Array.from(x)) visit(y);
            return;
        }
        if (typeof x === 'object') {
            for (const v of Object.values(x)) visit(v);
        }
    };

    visit(items);
    return out;
};

/**
 * Add a css class for a picture texture
 * @param {Object3DType[] | HTMLElement[] | NodeListOf<HTMLElement> | HTMLCollection | Object3DType | HTMLElement} [objects]
 * @param {TextureType} [texture='wood']
 */
const applyPictureTexture = (objects, texture = 'wood') => {
    loadCss('./textures.css', 'textures-css', import.meta.url);

    if (!TEXTURE_CLASSES.includes(texture)) {
        console.warn('[applyPictureTexture] unknown texture:', texture);
        return;
    }

    for (const item of normalize(objects)) {
        const el = hasEl(item) ? item.element : isEl(item) ? item : null;
        if (!el) continue;

        el.classList.add('texture');
        el.classList.remove(...TEXTURE_CLASSES);
        el.classList.add(texture);
    }
};
