import type { BaseFormProps } from 'src/components/shared/specPropEditor/types';

import SpecPropBoolean from 'src/components/shared/specPropEditor/SpecPropBoolean';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

export default function DeltaUpdatesForm({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) {
    const [setTargetSchemaHasError] = useSourceCaptureStore((state) => [
        state.setTargetSchemaHasError,
    ]);

    return (
        <SpecPropBoolean
            currentSetting={currentSetting}
            inputLabelId="schemaMode.input.label"
            scope={scope}
            updateDraftedSetting={updateDraftedSetting}
            setErrorExists={(errorExists) => {
                setTargetSchemaHasError(errorExists);
            }}
        />
    );
}
