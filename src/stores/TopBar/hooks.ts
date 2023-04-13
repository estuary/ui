import { useZustandStore } from 'context/Zustand/provider';
import { GlobalStoreNames } from 'stores/names';
import { TopBarState } from './types';

export const useTopBarStore_header = () => {
    return useZustandStore<TopBarState, TopBarState['header']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.header
    );
};
export const useTopBarStore_setHeader = () => {
    return useZustandStore<TopBarState, TopBarState['setHeader']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.setHeader
    );
};

export const useTopBarStore_headerLink = () => {
    return useZustandStore<TopBarState, TopBarState['headerLink']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.headerLink
    );
};
export const useTopBarStore_setHeaderLink = () => {
    return useZustandStore<TopBarState, TopBarState['setHeaderLink']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.setHeaderLink
    );
};

export const useSidePanelDocsStore_resetState = () => {
    return useZustandStore<TopBarState, TopBarState['resetState']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.resetState
    );
};
