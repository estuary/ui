import type { SourceCaptureState } from 'src/stores/SourceCapture/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialStateData = (): Pick<
    SourceCaptureState,
    | 'error'
    | 'sourceCapture'
    | 'saving'
    | 'prefilledCapture'
    | 'deltaUpdates'
    | 'deltaUpdatesHasError'
    | 'targetSchema'
    | 'targetSchemaHasError'
> => ({
    error: null,
    sourceCapture: undefined,
    saving: false,
    prefilledCapture: undefined,
    deltaUpdates: undefined,
    deltaUpdatesHasError: false,
    targetSchema: undefined,
    targetSchemaHasError: false,
});

const getInitialState = (
    set: NamedSet<SourceCaptureState>
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

    setPrefilledCapture: (value: SourceCaptureState['sourceCapture']) => {
        set(
            produce((state: SourceCaptureState) => {
                state.prefilledCapture = value;
            }),
            false,
            'Source Prefilled Capture Set'
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

    setDeltaUpdates: (value: SourceCaptureState['deltaUpdates']) => {
        set(
            produce((state: SourceCaptureState) => {
                state.deltaUpdates = value;
            }),
            false,
            'Source Capture Delta Updates Set'
        );
    },

    setDeltaUpdatesHasError: (value: SourceCaptureState['error']) => {
        set(
            produce((state: SourceCaptureState) => {
                state.deltaUpdatesHasError = value;
            }),
            false,
            'setDeltaUpdatesHasError'
        );
    },

    setTargetSchema: (value: SourceCaptureState['targetSchema']) => {
        set(
            produce((state: SourceCaptureState) => {
                state.targetSchema = value;
            }),
            false,
            'Source Capture Target Schema Set'
        );
    },
    setTargetSchemaHasError: (value: SourceCaptureState['error']) => {
        set(
            produce((state: SourceCaptureState) => {
                state.targetSchemaHasError = value;
            }),
            false,
            'setTargetSchemaHasError'
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

export const useSourceCaptureStore = create<SourceCaptureState>()(
    devtools((set) => getInitialState(set), devtoolsOptions('source-capture'))
);
