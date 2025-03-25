import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import type { NamedSet } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { GlobalStoreNames } from '../names';
import type { TopBarState } from './types';

const getInitialStateData = (): Pick<TopBarState, 'header' | 'headerLink'> => ({
    header: '',
    headerLink: undefined,
});

const getInitialState = (
    set: NamedSet<TopBarState>
    // get: StoreApi<SidePanelDocsState>['getState']
): TopBarState => ({
    ...getInitialStateData(),

    setHeader: (val) => {
        set(
            produce((state: TopBarState) => {
                state.header = val;
            }),
            false,
            'Top Bar Header Updated'
        );
    },

    setHeaderLink: (val) => {
        set(
            produce((state: TopBarState) => {
                state.headerLink = val;
            }),
            false,
            'Top Bar Header Link Updated'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Top Bar State Reset');
    },
});

export const useTopBarStore = create<TopBarState>()(
    devtools(
        (set, _get) => getInitialState(set),
        devtoolsOptions(GlobalStoreNames.TOP_BAR)
    )
);
