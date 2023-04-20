export interface SidePanelDocsState {
    // Control if we want to "animate" the resize
    animateOpening: boolean;
    // Used to prevent opening docs when URLs are not ours
    disabled: boolean;

    resetState: () => void;

    setAnimateOpening: (val: SidePanelDocsState['animateOpening']) => void;
    setShow: (val: SidePanelDocsState['show']) => void;

    setUrl: (val: SidePanelDocsState['url']) => void;
    // Controls if the panel is shown or hidden
    show: boolean;

    // Stores the URL for the docs
    url: string;
}
