import type { SidePanelDocsState } from 'src/stores/SidePanelDocs/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { GlobalStoreNames } from 'src/stores/names';
import { getDocsSettings } from 'src/utils/env-utils';
import { devtoolsOptions } from 'src/utils/store-utils';

const { iframeStringInclude } = getDocsSettings();

const getInitialStateData = (): Pick<
    SidePanelDocsState,
    'animateOpening' | 'disabled' | 'url'
> => ({
    animateOpening: false,
    disabled: false,
    url: '',
});

const getInitialState = (
    set: NamedSet<SidePanelDocsState>
    // get: StoreApi<SidePanelDocsState>['getState']
): SidePanelDocsState => ({
    ...getInitialStateData(),

    setAnimateOpening: (val) => {
        set(
            produce((state: SidePanelDocsState) => {
                state.animateOpening = val;
            }),
            false,
            'Side Panel Docs Animate Opening Updated'
        );
    },

    setUrl: (val) => {
        set(
            produce((state: SidePanelDocsState) => {
                state.url = val;
                state.disabled = !val.includes(iframeStringInclude);
            }),
            false,
            'Side Panel Docs URL Updated'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Side Panel Docs State Reset');
    },
});

export const useSidePanelDocsStore = create<SidePanelDocsState>()(
    devtools(
        (set, _get) => getInitialState(set),
        devtoolsOptions(GlobalStoreNames.SIDE_PANEL_DOCS)
    )
);
