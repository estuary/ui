import produce from 'immer';
import { getDocsSettings } from 'utils/env-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { GlobalStoreNames } from '../names';
import { SidePanelDocsState } from './types';

const { iframeStringInclude } = getDocsSettings();

const getInitialStateData = (): Pick<SidePanelDocsState, 'url' | 'show'> => ({
    show: false,
    url: '',
});

const getInitialState = (
    set: NamedSet<SidePanelDocsState>,
    get: StoreApi<SidePanelDocsState>['getState']
): SidePanelDocsState => ({
    ...getInitialStateData(),

    setShow: (val) => {
        set(
            produce((state: SidePanelDocsState) => {
                console.log('3', val);

                state.show = val;
            }),
            false,
            'Side Panel Docs Show Updated'
        );
    },

    setUrl: (val) => {
        set(
            produce((state: SidePanelDocsState) => {
                const { resetState } = get();
                console.log('1', val);
                if (val.includes(iframeStringInclude)) {
                    state.url = val;
                    state.show = true;
                } else {
                    console.log('2');
                    resetState();
                }
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
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
