export interface SourceCaptureState {
    sourceCapture: string | null;
    setSourceCapture: (value: SourceCaptureState['sourceCapture']) => void;

    saving: boolean;
    setSaving: (value: SourceCaptureState['saving']) => void;

    error: any;
    setError: (value: SourceCaptureState['error']) => void;

    // Misc.
    resetState: () => void;
}
