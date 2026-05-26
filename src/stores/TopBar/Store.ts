import type { TopBarState } from 'src/stores/TopBar/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { GlobalStoreNames } from 'src/stores/names';
import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialStateData = (): Pick<
    TopBarState,
    'header' | 'headerBreadcrumbs' | 'headerLink'
> => ({
    header: '',
    headerBreadcrumbs: undefined,
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

    setHeaderBreadcrumbs: (val) => {
        set(
            produce((state: TopBarState) => {
                state.headerBreadcrumbs = val;
            }),
            false,
            'Top Bar Header Breadcrumbs Updated'
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
