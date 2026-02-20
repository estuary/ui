import type { BackfillModeSelectorProps } from 'src/components/editor/Bindings/Backfill/types';

import { useIntl } from 'react-intl';

import SelectorOption from 'src/components/incompatibleSchemaChange/SelectorOption';
import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';
import useBackfillModeOptions from 'src/hooks/bindings/useBackfillModeOptions';
import { useBinding_backfilledBindings_count } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function BackfillModeSelector({ disabled }: BackfillModeSelectorProps) {
    const intl = useIntl();
    const backfillCount = useBinding_backfilledBindings_count();
    const formActive = useFormStateStore_isActive();

    const setBackfillMode = useBindingStore((state) => state.setBackfillMode);

    const { currentOption, isOptionEqualToValue, options } =
        useBackfillModeOptions();

    if (backfillCount < 1) {
        return null;
    }

    return (
        <AutocompletedField
            label={intl.formatMessage({
                id: 'workflows.dataFlowBackfill.label',
            })}
            options={options}
            defaultValue={currentOption}
            changeHandler={(_event, option: any) => {
                setBackfillMode(option.val);
            }}
            autocompleteSx={{ flexGrow: 1 }}
            AutoCompleteOptions={{
                disabled: formActive,
                isOptionEqualToValue,
                renderOption: (renderOptionProps, option: any) => {
                    return (
                        <li {...renderOptionProps}>
                            <SelectorOption option={option} />
                        </li>
                    );
                },
                value: currentOption,
            }}
        />
    );
}

export default BackfillModeSelector;
