import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { ScopedSystemGraphState } from './types';

const getInitialStateData = (): Pick<
    ScopedSystemGraphState,
    'maxZoom' | 'minZoom' | 'userZoomingEnabled' | 'zoom'
> => ({
    maxZoom: 5,
    minZoom: 0.5,
    userZoomingEnabled: false,
    zoom: 1,
});

const getInitialState = (
    set: NamedSet<ScopedSystemGraphState>,
    get: StoreApi<ScopedSystemGraphState>['getState']
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

    setZoom: (cyCore, rawValue) => {
        const { maxZoom, minZoom } = get();

        const value = rawValue
            ? Math.round(rawValue * 10) / 10
            : cyCore
            ? cyCore.zoom()
            : 1;

        if (value >= minZoom && value <= maxZoom) {
            if (rawValue) {
                cyCore?.zoom(value);
            }

            set(
                produce((state: ScopedSystemGraphState) => {
                    state.zoom = value;
                }),
                false,
                'zoom setting updated'
            );
        }
    },
});

export const useScopedSystemGraph = create<ScopedSystemGraphState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('scoped-system-graph')
    )
);
