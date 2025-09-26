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
                const deltaUpdatesSupportedAndExists =
                    sourceCaptureDeltaUpdatesSupported && state.deltaUpdates;

                const targetSchemaSupportedAndExists =
                    sourceCaptureTargetSchemaSupported && state.targetSchema;
                if (
                    state.sourceCapture ||
                    deltaUpdatesSupportedAndExists ||
                    targetSchemaSupportedAndExists
                ) {
                    const response: SourceCaptureDef = {};

                    if (state.sourceCapture) {
                        response.capture = state.sourceCapture;
                    }

                    if (deltaUpdatesSupportedAndExists) {
                        response.deltaUpdates = state.deltaUpdates;
                    }

                    if (targetSchemaSupportedAndExists) {
                        response.targetNaming = state.targetSchema;
                    }

                    if (
                        typeof state.fieldsRecommended === 'number' ||
                        typeof state.fieldsRecommended === 'boolean'
                    ) {
                        response.fieldsRecommended = state.fieldsRecommended;
                    }

                    return response;
                }

                return null;
            })
        );
    };
