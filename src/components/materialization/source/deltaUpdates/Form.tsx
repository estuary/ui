import type { BaseFormProps } from 'src/components/shared/specPropEditor/types';

import SpecPropBoolean from 'src/components/shared/specPropEditor/SpecPropBoolean';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

export default function DeltaUpdatesForm({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) {
    const [setDeltaUpdatesHasError] = useSourceCaptureStore((state) => [
        state.setDeltaUpdatesHasError,
    ]);

    return (
        <SpecPropBoolean
            currentSetting={currentSetting}
            inputLabelId="deltaUpdates.input.label"
            scope={scope}
            updateDraftedSetting={updateDraftedSetting}
            setErrorExists={(errorExists) => {
                setDeltaUpdatesHasError(errorExists);
            }}
        />
    );
}
