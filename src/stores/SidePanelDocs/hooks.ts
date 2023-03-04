import { useZustandStore } from 'context/Zustand/provider';
import { GlobalStoreNames } from 'stores/names';
import { SidePanelDocsState } from './types';

export const useSidePanelDocsStore_disabled = () => {
    return useZustandStore<SidePanelDocsState, SidePanelDocsState['disabled']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.disabled
    );
};

export const useSidePanelDocsStore_show = () => {
    return useZustandStore<SidePanelDocsState, SidePanelDocsState['show']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.show
    );
};
export const useSidePanelDocsStore_setShow = () => {
    return useZustandStore<SidePanelDocsState, SidePanelDocsState['setShow']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.setShow
    );
};

export const useSidePanelDocsStore_url = () => {
    return useZustandStore<SidePanelDocsState, SidePanelDocsState['url']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.url
    );
};
export const useSidePanelDocsStore_setUrl = () => {
    return useZustandStore<SidePanelDocsState, SidePanelDocsState['setUrl']>(
        GlobalStoreNames.SIDE_PANEL_DOCS,
        (state) => state.setUrl
    );
};

export const useSidePanelDocsStore_resetState = () => {
    return useZustandStore<
        SidePanelDocsState,
        SidePanelDocsState['resetState']
    >(GlobalStoreNames.SIDE_PANEL_DOCS, (state) => state.resetState);
};
