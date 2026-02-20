import type { BaseFormProps } from 'src/components/shared/specPropEditor/types';

import { useEffect, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';

import SpecPropBoolean from 'src/components/shared/specPropEditor/SpecPropBoolean';
import { useEntityWorkflow } from 'src/context/Workflow';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

export default function DeltaUpdatesForm({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) {
    const workflow = useEntityWorkflow();

    const [setDeltaUpdatesHasError, setDeltaUpdates] = useSourceCaptureStore(
        useShallow((state) => [state.setDeltaUpdatesHasError, state.setDeltaUpdates])
    );

    // If we are editing make sure we store the current value into the store "on load"
    const defaultValue = useRef(workflow === 'materialization_edit');
    useEffect(() => {
        if (defaultValue.current) {
            if (currentSetting) {
                setDeltaUpdates(currentSetting);
                defaultValue.current = false;
            }
        }
    }, [currentSetting, setDeltaUpdates]);

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
