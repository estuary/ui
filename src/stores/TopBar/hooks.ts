import { useZustandStore } from 'context/Zustand/provider';
import { GlobalStoreNames } from 'stores/names';
import { TopBarState } from './types';

export const useTopBarStore_header = () => {
    return useZustandStore<TopBarState, TopBarState['header']>(
        GlobalStoreNames.TOP_BAR,
        (state) => state.header
    );
};
export const useTopBarStore_setHeader = () => {
    return useZustandStore<TopBarState, TopBarState['setHeader']>(
        GlobalStoreNames.TOP_BAR,
        (state) => state.setHeader
    );
};

export const useTopBarStore_headerLink = () => {
    return useZustandStore<TopBarState, TopBarState['headerLink']>(
        GlobalStoreNames.TOP_BAR,
        (state) => state.headerLink
    );
};
export const useTopBarStore_setHeaderLink = () => {
    return useZustandStore<TopBarState, TopBarState['setHeaderLink']>(
        GlobalStoreNames.TOP_BAR,
        (state) => state.setHeaderLink
    );
};

export const useSidePanelDocsStore_resetState = () => {
    return useZustandStore<TopBarState, TopBarState['resetState']>(
        GlobalStoreNames.TOP_BAR,
        (state) => state.resetState
    );
};
