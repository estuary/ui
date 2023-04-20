import produce from 'immer';
import { getDocsSettings } from 'utils/env-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { GlobalStoreNames } from '../names';
import { SidePanelDocsState } from './types';

const { iframeStringInclude } = getDocsSettings();

const getInitialStateData = (): Pick<
    SidePanelDocsState,
    'animateOpening' | 'disabled' | 'url' | 'show'
> => ({
    animateOpening: false,
    disabled: false,
    show: false,
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

    setShow: (val) => {
        set(
            produce((state: SidePanelDocsState) => {
                state.show = val;
            }),
            false,
            'Side Panel Docs Show Updated'
        );
    },

    setUrl: (val) => {
        set(
            produce((state: SidePanelDocsState) => {
                const urlIsFromEstuary = val.includes(iframeStringInclude);

                state.url = val;
                state.show = true;
                state.disabled = !urlIsFromEstuary;
            }),
            false,
            'Side Panel Docs URL Updated'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Side Panel Docs State Reset');
    },
});

export const createSidePanelDocsStore = (key: GlobalStoreNames) => {
    return create<SidePanelDocsState>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
};
