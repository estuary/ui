export interface SidePanelDocsState {
    // Used to prevent opening docs when URLs are not ours
    disabled: boolean;

    // Stores the URL for the docs
    url: string;
    setUrl: (val: SidePanelDocsState['url']) => void;

    // Control if we want to "animate" the resize
    animateOpening: boolean;
    setAnimateOpening: (val: SidePanelDocsState['animateOpening']) => void;

    resetState: () => void;
}
