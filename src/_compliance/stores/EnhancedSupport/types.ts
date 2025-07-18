export interface EnhancedSupportState {
    enhancedSupportEnabled: boolean;
    setEnhancedSupportEnabled: (val: boolean) => void;

    enhancedSupportExpiration: any;
    setEnhancedSupportExpiration: (val: any) => void;

    sessionRecordingEnabled: boolean;
    setSessionRecordingEnabled: (val: boolean) => void;

    sessionRecordingExpiration: any;
    setSessionRecordingExpiration: (val: any) => void;
}
