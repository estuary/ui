export const ICON_SIZE = 14;

export const DEFAULT_TOOLBAR_HEIGHT = 20;
export const DEFAULT_HEIGHT = 330;

// The two pixels added to the composite height accounts for
// the presence of a top and bottom, pixel-wide border.
export const getEditorTotalHeight = (
    editorHeight?: number,
    toolbarHeight?: number
) => {
    return (
        (editorHeight ?? DEFAULT_HEIGHT) +
        (toolbarHeight ?? DEFAULT_TOOLBAR_HEIGHT) +
        2
    );
};
