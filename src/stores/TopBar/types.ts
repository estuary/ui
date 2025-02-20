export interface TopBarState {
    // The message to display as the page header
    header: string | undefined;
    setHeader: (val: TopBarState['header']) => void;

    // The docs link next to the page title
    headerLink: string | undefined;
    setHeaderLink: (val: TopBarState['headerLink']) => void;

    bannerOpen: boolean;
    setBannerOpen: (value: TopBarState['bannerOpen']) => void;

    resetState: () => void;
}
