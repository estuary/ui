import type { TargetSchemas } from 'src/types';

export interface SourceCaptureState {
    sourceCapture: string | undefined;
    setSourceCapture: (value: SourceCaptureState['sourceCapture']) => void;

    prefilledCapture: string | undefined;
    setPrefilledCapture: (
        value: SourceCaptureState['prefilledCapture']
    ) => void;

    deltaUpdates: boolean | undefined;
    setDeltaUpdates: (value: SourceCaptureState['deltaUpdates']) => void;
    deltaUpdatesHasError: boolean;
    setDeltaUpdatesHasError: (
        value: SourceCaptureState['deltaUpdatesHasError']
    ) => void;

    targetSchema: TargetSchemas | undefined;
    setTargetSchema: (value: SourceCaptureState['targetSchema']) => void;
    targetSchemaHasError: boolean;
    setTargetSchemaHasError: (
        value: SourceCaptureState['targetSchemaHasError']
    ) => void;

    saving: boolean;
    setSaving: (value: SourceCaptureState['saving']) => void;

    error: any;
    setError: (value: SourceCaptureState['error']) => void;

    // Misc.
    resetState: () => void;
}
