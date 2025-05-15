import type {
    BaseAutoCompleteOption,
    BaseFormProps,
} from 'src/components/shared/specPropertyEditor/types';

import SelectorOption from 'src/components/incompatibleSchemaChange/SelectorOption';
import SpecPropAutoComplete from 'src/components/shared/specPropertyEditor/SpecPropAutoComplete';
import useSupportedOptions from 'src/hooks/OnIncompatibleSchemaChange/useSupportedOptions';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function IncompatibleSchemaChangeForm({
    currentSetting,
    scope,
    updateDraftedSetting,
}: BaseFormProps) {
    const setOnIncompatibleSchemaChangeErrorExists = useBindingStore(
        (state) => state.setOnIncompatibleSchemaChangeErrorExists
    );

    const options = useSupportedOptions();

    return (
        <SpecPropAutoComplete
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
            updateDraftedSetting={(selectedOption?: BaseAutoCompleteOption) => {
                updateDraftedSetting(selectedOption?.val ?? undefined);
            }}
            setErrorExists={(errorExists, scope) => {
                setOnIncompatibleSchemaChangeErrorExists(errorExists, scope);
            }}
        />
    );
}
