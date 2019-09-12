export const supportsConstructibleStylesheets = (() => {
    try { return !!new CSSStyleSheet(); }
    catch (e) { return false; }
})();