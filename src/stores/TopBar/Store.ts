import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { GlobalStoreNames } from 'src/stores/names';
import { devtoolsOptions } from 'src/utils/store-utils';

interface TopBarState {
    // The message to display as the page header
    header: string | undefined;
    setHeader: (val: TopBarState['header']) => void;

    // A trailing breadcrumb segment naming what the page is currently showing,
    // such as the selected entity. Displayed verbatim after the header, so it
    // takes an already-resolved string rather than a message id.
    headerDetail: string | undefined;
    setHeaderDetail: (val: TopBarState['headerDetail']) => void;

    // The docs link next to the page title
    headerLink: string | undefined;
    setHeaderLink: (val: TopBarState['headerLink']) => void;

    resetState: () => void;
}

const getInitialStateData = (): Pick<
    TopBarState,
    'header' | 'headerDetail' | 'headerLink'
> => ({
    header: '',
    headerDetail: undefined,
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

    setHeaderDetail: (val) => {
        set(
            produce((state: TopBarState) => {
                state.headerDetail = val;
            }),
            false,
            'Top Bar Header Detail Updated'
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
