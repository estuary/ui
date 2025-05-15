import type { AutoCompleteOption } from 'src/components/materialization/source/targetSchema/types';
import type { BaseFormProps } from 'src/components/shared/specPropEditor/types';

import SelectorOption from 'src/components/materialization/source/targetSchema/SelectorOption';
import SpecPropAutoComplete from 'src/components/shared/specPropEditor/SpecPropAutoComplete';
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
        <SpecPropAutoComplete
            currentSetting={currentSetting}
            inputLabelId="schemaMode.input.label"
            options={options}
            scope={scope}
            renderOption={(renderOptionProps, option: AutoCompleteOption) => {
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
