import { SourceCaptureDef } from 'types';
import { Nullable } from 'types/utils';
import { useShallow } from 'zustand/react/shallow';
import { useSourceCaptureStore } from './Store';

export const useSourceCaptureStore_SourceCaptureDefinition =
    (): Nullable<SourceCaptureDef> =>
        useSourceCaptureStore(
            useShallow((state) => {
                return {
                    capture: state.sourceCapture,
                    deltaUpdates: state.deltaUpdates,
                    targetSchema: state.targetSchema,
                };
            })
        );
