import type { SourceCaptureDef } from 'src/types';

import { useShallow } from 'zustand/react/shallow';

import { useBinding_sourceCaptureFlags } from 'src/stores/Binding/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

export const useSourceCaptureStore_sourceCaptureDefinition =
    (): SourceCaptureDef | null => {
        const {
            sourceCaptureDeltaUpdatesSupported,
            sourceCaptureTargetSchemaSupported,
        } = useBinding_sourceCaptureFlags();

        return useSourceCaptureStore(
            useShallow((state) => {
                if (
                    state.sourceCapture ||
                    state.deltaUpdates ||
                    state.targetSchema
                ) {
                    const response: SourceCaptureDef = {};

                    if (state.sourceCapture) {
                        response.capture = state.sourceCapture;
                    }

                    if (
                        sourceCaptureDeltaUpdatesSupported &&
                        state.deltaUpdates
                    ) {
                        response.deltaUpdates = state.deltaUpdates;
                    }

                    if (
                        sourceCaptureTargetSchemaSupported &&
                        state.targetSchema
                    ) {
                        response.targetSchema = state.targetSchema;
                    }

                    return response;
                }

                return null;
            })
        );
    };
