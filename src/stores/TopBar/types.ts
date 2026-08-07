export interface TopBarState {
    // The message to display as the page header
    header: string | undefined;
    setHeader: (val: TopBarState['header']) => void;

    // A trailing breadcrumb segment naming what the page is currently showing,
    // such as the selected entity. Displayed verbatim after the header, so it
    // takes an already-resolved string rather than a message id.
    headerDetail: string | undefined;
    setHeaderDetail: (val: TopBarState['headerDetail']) => void;

    // The docs link next to the page title
    headerLink: string | undefined;
    setHeaderLink: (val: TopBarState['headerLink']) => void;

    resetState: () => void;
}
