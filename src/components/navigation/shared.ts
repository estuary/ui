export const BANNER_HEIGHT = 28;

export const isOverflown = (el: HTMLElement | null) => {
    if (!el) {
        return false;
    }

    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
};
