import type { BaseFormProps } from 'src/components/shared/specPropertyEditor/types';

import SelectorOption from 'src/components/incompatibleSchemaChange/SelectorOption';
import SpecPropertyEditorForm from 'src/components/shared/specPropertyEditor/SpecPropertyEditorForm';
import useTargetNamingOptions from 'src/hooks/sourceCapture/useTargetNamingOptions';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

export default function TargetSchemaForm({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) {
    const [setTargetSchemaHasError] = useSourceCaptureStore((state) => [
        state.setTargetSchemaHasError,
    ]);

    const options = useTargetNamingOptions();

    return (
        <SpecPropertyEditorForm
            currentSetting={currentSetting}
            inputLabelId="schemaMode.input.label"
            invalidSettingsMessageId="schemaMode.error.message"
            options={options}
            scope={scope}
            renderOption={(renderOptionProps, option) => {
                return (
                    <li {...renderOptionProps}>
                        <SelectorOption option={option} />
                    </li>
                );
            }}
            updateDraftedSetting={updateDraftedSetting}
            setErrorExists={(errorExists) => {
                setTargetSchemaHasError(errorExists);
            }}
        />
    );
}
