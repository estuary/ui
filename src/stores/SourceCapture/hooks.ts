import { useCallback } from 'react';
import { useBindingStore } from 'stores/Binding/Store';
import { SourceCaptureDef } from 'types';
import { useShallow } from 'zustand/react/shallow';
import { useSourceCaptureStore } from './Store';

export const useSourceCaptureStore_sourceCaptureDefinition =
    (): SourceCaptureDef | null => {
        const [
            sourceCaptureDeltaUpdatesSupported,
            sourceCaptureTargetSchemaSupported,
        ] = useBindingStore((state) => [
            state.sourceCaptureDeltaUpdatesSupported,
            state.sourceCaptureTargetSchemaSupported,
        ]);

        return useSourceCaptureStore(
            useShallow((state) => {
                if (state.sourceCapture) {
                    const response: SourceCaptureDef = {
                        capture: state.sourceCapture,
                    };

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

export const useSourceCaptureStore_setSourceCaptureDefinition = () => {
    const [setSourceCapture, setDeltaUpdates, setTargetSchema] =
        useSourceCaptureStore((state) => [
            state.setSourceCapture,
            state.setDeltaUpdates,
            state.setTargetSchema,
        ]);

    return useCallback(
        (newVal: SourceCaptureDef | null) => {
            if (!newVal) {
                setSourceCapture(null);
                setDeltaUpdates(undefined);
                setTargetSchema(undefined);
                return;
            }

            // Mainly here to handle defaulting this different on
            //  edit and create
            if (newVal.capture.length > 0) {
                setSourceCapture(newVal.capture);
            }

            setDeltaUpdates(newVal.deltaUpdates);
            setTargetSchema(newVal.targetSchema);
        },
        [setDeltaUpdates, setSourceCapture, setTargetSchema]
    );
};
