import {
    Autocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    AutocompleteProps,
    AutocompleteRenderInputParams,
    ListItemText,
    SxProps,
    TextField,
    Theme,
} from '@mui/material';
import { ReactNode } from 'react';
import { autoCompleteDefaults_Virtual_Clearable } from '../AutoComplete/DefaultProps';

interface Props {
    label: string;
    options: any[];
    changeHandler: (
        event: React.SyntheticEvent<Element, Event>,
        value: any,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<string> | undefined
    ) => void;
    autocompleteSx?: SxProps<Theme>;
    defaultValue?: any;
    id?: string;
    required?: boolean;
    AutoCompleteOptions?: Partial<
        AutocompleteProps<any, false, true, false, 'div'>
    >;
}

function AutocompletedField({
    autocompleteSx,
    changeHandler,
    defaultValue,
    id,
    label,
    options,
    required,
    AutoCompleteOptions,
}: Props) {
    return (
        <Autocomplete
            {...autoCompleteDefaults_Virtual_Clearable}
            defaultValue={defaultValue}
            id={id}
            onChange={changeHandler}
            options={options}
            sx={autocompleteSx}
            {...AutoCompleteOptions}
            renderInput={({
                InputProps,
                ...params
            }: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    InputProps={{
                        ...InputProps,
                        sx: { borderRadius: 3 },
                    }}
                    label={label}
                    required={required}
                    size="small"
                    variant="outlined"
                />
            )}
            renderOption={(renderOptionProps, option, state) => {
                const RowContent = <ListItemText primary={option} />;

                return [
                    renderOptionProps,
                    RowContent,
                    state.selected,
                ] as ReactNode;
            }}
        />
    );
}

export default AutocompletedField;
