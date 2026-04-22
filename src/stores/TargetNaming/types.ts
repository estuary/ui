import type { TargetNamingModel, TargetNamingStrategy } from 'src/types';

export interface TargetNamingState {
    // Which model version was detected at spec load time (or 'rootTargetNaming' for create).
    // null means the connector does not support x_schema_name.
    model: TargetNamingModel;
    setModel: (model: TargetNamingState['model']) => void;

    // The current strategy value.
    // For rootTargetNaming: a TargetNamingStrategy object (or null if not yet set).
    // For sourceTargetNaming: null (the old string value stays in SourceCaptureStore).
    strategy: TargetNamingStrategy | null;
    setStrategy: (strategy: TargetNamingState['strategy']) => void;

    saving: boolean;
    setSaving: (saving: boolean) => void;

    resetState: () => void;
}
