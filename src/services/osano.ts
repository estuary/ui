export const showCookieDrawer = () => {
    if (window.Osano?.cm?.showDrawer) {
        window.Osano.cm.showDrawer('osano-cm-dom-info-dialog-open');
    }
};

export const osanoActive = () => {
    return window.Osano?.cm?.mode !== 'debug';
};
