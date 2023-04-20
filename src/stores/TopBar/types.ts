export interface TopBarState {
    // The message to display as the page header
    header: string | undefined;
    // The docs link next to the page title
    headerLink: string | undefined;

    resetState: () => void;
    setHeader: (val: TopBarState['header']) => void;

    setHeaderLink: (val: TopBarState['headerLink']) => void;
}
