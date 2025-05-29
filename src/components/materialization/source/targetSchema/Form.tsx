import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';
import type { BaseFormProps } from 'src/components/shared/specPropEditor/types';

import SelectorOption from 'src/components/materialization/source/targetSchema/SelectorOption';
import SpecPropAutoComplete from 'src/components/shared/specPropEditor/SpecPropAutoComplete';
import useTargetSchemaOptions from 'src/hooks/sourceCapture/useTargetSchemaOptions';
import { compareOptionsIncludingAliases } from 'src/stores/SourceCapture/shared';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

export default function TargetSchemaForm({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) {
    // const workflow = useEntityWorkflow();

    const [
        setTargetSchemaHasError,
        // setTargetSchema
    ] = useSourceCaptureStore((state) => [
        state.setTargetSchemaHasError,
        // state.setTargetSchema
    ]);

    const options = useTargetSchemaOptions();

    // useMount(() => {
    //     if (workflow === 'materialization_create') {
    //         setTargetSchema('prefixNonDefaultSchema');
    //     }
    // });

    return (
        <SpecPropAutoComplete
            currentSetting={currentSetting}
            inputLabelId="schemaMode.input.label"
            options={options}
            scope={scope}
            isOptionEqualToValue={compareOptionsIncludingAliases}
            renderOption={(
                renderOptionProps,
                option: AutoCompleteOptionForTargetSchema
            ) => {
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
            sx={{
                maxWidth: 700,
            }}
        />
    );
}
