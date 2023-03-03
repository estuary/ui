export interface SidePanelDocsState {
    show: boolean;
    setShow: (val: SidePanelDocsState['show']) => void;

    url: string;
    setUrl: (val: SidePanelDocsState['url']) => void;

    resetState: () => void;
}
