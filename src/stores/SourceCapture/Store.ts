import produce from 'immer';
import { MiscStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { SourceCaptureState } from './types';

const getInitialStateData = () => ({
    error: null,
    sourceCapture: null,
    saving: false,
});

const getInitialState = (
    set: NamedSet<SourceCaptureState>
    // get: StoreApi<SourceCaptureState>['getState']
): SourceCaptureState => ({
    ...getInitialStateData(),

    setSourceCapture: (value: SourceCaptureState['sourceCapture']) => {
        set(
            produce((state: SourceCaptureState) => {
                state.sourceCapture = value;
            }),
            false,
            'Source Capture Set'
        );
    },

    setSaving: (value: SourceCaptureState['saving']) => {
        set(
            produce((state: SourceCaptureState) => {
                state.saving = value;
            }),
            false,
            'Source Capture Saving Set'
        );
    },

    setError: (value: SourceCaptureState['error']) => {
        set(
            produce((state: SourceCaptureState) => {
                state.error = value;
            }),
            false,
            'Source Capture Error Set'
        );
    },

    resetState: () => {
        set(
            {
                ...getInitialStateData(),
            },
            false,
            'Source Capture Reset'
        );
    },
});

export const createSourceCaptureStore = (key: MiscStoreNames) => {
    return create<SourceCaptureState>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
};
