import { Autocomplete, Grid, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual } from 'components/shared/AutoComplete/DefaultProps';
import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useBindingStore } from 'stores/Binding/Store';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';
import { RelatedMaterializationSelectorProps } from './types';
import SelectorOption from './SelectorOption';

const getValue = (option: any) =>
    typeof option === 'string' ? option : option?.catalog_name;

function Selector({ disabled, keys }: RelatedMaterializationSelectorProps) {
    const intl = useIntl();

    const stepIndex = useLoopIndex();

    const [updateStep, updateContext] = usePreSavePromptStore((state) => [
        state.updateStep,
        state.updateContext,
    ]);

    const [inputValue, setInputValue] = useState('');

    const [backfillDataFlowTarget, setBackfillDataFlowTarget] = useBindingStore(
        (state) => [
            state.backfillDataFlowTarget,
            state.setBackfillDataFlowTarget,
        ]
    );

    if (keys.length === 0) {
        return null;
    }

    return (
        <Grid item xs={12}>
            <Autocomplete
                {...autoCompleteDefaults_Virtual}
                disabled={disabled}
                getOptionLabel={getValue}
                inputValue={inputValue}
                isOptionEqualToValue={(option, optionValue) => {
                    return option.catalog_name === optionValue;
                }}
                options={keys}
                value={backfillDataFlowTarget}
                onChange={(_event, newValue) => {
                    const backfillTarget = newValue
                        ? newValue.catalog_name
                        : null;

                    // Need to save the data somewhere better
                    setBackfillDataFlowTarget(backfillTarget);

                    updateStep(stepIndex, {
                        valid: Boolean(backfillTarget),
                    });

                    updateContext({
                        backfillTarget,
                    });
                }}
                onInputChange={(_event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            disabled={disabled}
                            helperText={intl.formatMessage({
                                id: 'resetDataFlow.materializations.selector.helper',
                            })}
                            label={intl.formatMessage({
                                id: 'resetDataFlow.materializations.selector.label',
                            })}
                            variant="standard"
                        />
                    );
                }}
                renderOption={(renderOptionProps, option, state) => {
                    const RowContent = (
                        <SelectorOption
                            option={option}
                            x-react-window-item-height={75}
                        />
                    );

                    return [
                        renderOptionProps,
                        RowContent,
                        state.selected,
                    ] as ReactNode;
                }}
            />
        </Grid>
    );
}

export default Selector;
