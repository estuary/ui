import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { ScopedSystemGraphState } from './types';

const getInitialStateData = (): Pick<
    ScopedSystemGraphState,
    'userZoomingEnabled'
> => ({
    userZoomingEnabled: false,
});

const getInitialState = (
    set: NamedSet<ScopedSystemGraphState>,
    _get: StoreApi<ScopedSystemGraphState>['getState']
): ScopedSystemGraphState => ({
    ...getInitialStateData(),

    setUserZoomingEnabled: (cyCore, value) => {
        set(
            produce((state: ScopedSystemGraphState) => {
                cyCore?.userZoomingEnabled(value);
                state.userZoomingEnabled = value;
            }),
            false,
            'userZoomingEnabled setting updated'
        );
    },
});

export const useScopedSystemGraph = create<ScopedSystemGraphState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('scoped-system-graph')
    )
);
