import { Autocomplete, Grid, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { RelatedMaterializationSelectorProps } from './types';
import MaterializationSelectorOption from './MaterializationSelectorOption';

const getValue = (option: any) => option.catalog_name;

function RelatedMaterializationSelector({
    disabled,
    keys,
}: RelatedMaterializationSelectorProps) {
    const intl = useIntl();
    const [localCopyValue] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

    console.log('keys', keys);

    if (keys.length === 0) {
        return null;
    }

    return (
        <Grid item xs={12}>
            <Autocomplete
                {...autoCompleteDefaults_Virtual_Multiple}
                disabled={disabled}
                getOptionLabel={getValue}
                groupBy={(option) => option.exists}
                inputValue={inputValue}
                isOptionEqualToValue={(option, optionValue) => {
                    return option.catalog_name === optionValue;
                }}
                options={keys}
                value={localCopyValue}
                onChange={async (event, newValues, reason) => {
                    console.log('object', {
                        event,
                        newValues,
                        reason,
                    });
                    // if (changeHandler) {
                    //     await changeHandler(
                    //         event,
                    //         newValues.map((newValue) => {
                    //             if (typeof newValue === 'string') {
                    //                 return newValue;
                    //             } else {
                    //                 return getValue(newValue);
                    //             }
                    //         }),
                    //         reason
                    //     );
                    // }
                }}
                onInputChange={(event, newInputValue) => {
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
