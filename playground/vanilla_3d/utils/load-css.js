export {
    loadCss
}

/**
 * Dynamically loads a CSS stylesheet into the document head.
 *
 * The stylesheet is only added once.
 * If an element with the given id already exists, or a stylesheet
 * with the same resolved URL is already present, the call is ignored.
 *
 * The href is resolved relative to baseUrl using the URL constructor,
 * which makes the function safe for usage with import.meta.url.
 *
 * @param {String} href         Path or URL of the stylesheet to load
 * @param {String} id           id assigned to the <link> element
 * @param {String} [baseUrl]    Base URL used to resolve href (Default: import.meta.url)
 *
 * @returns {void}
 */
const loadCss = (href, id, baseUrl = import.meta.url) => {
    if (id && document.getElementById(id)) return;
    const url = new URL(href, baseUrl).href;

    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href === url)) return;

    const link = document.createElement('link');
    if (id) link.id = id;
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
};
