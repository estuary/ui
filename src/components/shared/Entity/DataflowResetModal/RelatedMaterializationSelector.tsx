import { Autocomplete, Grid, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual } from 'components/shared/AutoComplete/DefaultProps';
import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import { RelatedMaterializationSelectorProps } from './types';
import MaterializationSelectorOption from './MaterializationSelectorOption';

const getValue = (option: any) => option.catalog_name;

function RelatedMaterializationSelector({
    disabled,
    keys,
}: RelatedMaterializationSelectorProps) {
    const intl = useIntl();

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
                    return option.catalog_name === optionValue.catalog_name;
                }}
                options={keys}
                value={backfillDataFlowTarget}
                onChange={(_event, newValue) => {
                    setBackfillDataFlowTarget(newValue);
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
                    const { catalog_name, logo_url } = option;

                    const RowContent = (
                        <MaterializationSelectorOption
                            name={catalog_name}
                            logo={logo_url}
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

export default RelatedMaterializationSelector;
