export interface SourceCaptureState {
    sourceCapture: string | null;
    setSourceCapture: (value: SourceCaptureState['sourceCapture']) => void;

    prefilledCapture: string | null;
    setPrefilledCapture: (
        value: SourceCaptureState['prefilledCapture']
    ) => void;

    saving: boolean;
    setSaving: (value: SourceCaptureState['saving']) => void;

    error: any;
    setError: (value: SourceCaptureState['error']) => void;

    // Misc.
    resetState: () => void;
}
