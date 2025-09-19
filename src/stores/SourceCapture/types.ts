import type { targetNamingOptions } from 'src/stores/SourceCapture/shared';

export type TargetSchemas = (typeof targetNamingOptions)[number];

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

    fieldsRecommended: boolean | number | undefined;
    setFieldsRecommended: (
        value: SourceCaptureState['fieldsRecommended']
    ) => void;
    fieldsRecommendedErrorExists: boolean;
    setFieldsRecommendedErrorExists: (
        value: SourceCaptureState['deltaUpdatesHasError']
    ) => void;

    saving: boolean;
    setSaving: (value: SourceCaptureState['saving']) => void;

    error: any;
    setError: (value: SourceCaptureState['error']) => void;

    // Misc.
    resetState: () => void;
}
