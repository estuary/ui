import {
    Autocomplete,
    AutocompleteRenderInputParams,
    TextField,
} from '@mui/material';
import { SyntheticEvent } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    onSelectOption: (
        event: SyntheticEvent<Element, Event>,
        value: string | null
    ) => void;
    options: { [id: string]: string };
    disabled?: boolean;
}

function NodeSearch({ disabled, onSelectOption, options }: Props) {
    const intl = useIntl();

    return (
        <Autocomplete
            disabled={disabled}
            filterOptions={(ids, { inputValue }) =>
                ids
                    .filter((id) => options[id].includes(inputValue))
                    .slice(0, 10)
            }
            getOptionLabel={(id) => options[id]}
            onChange={onSelectOption}
            options={Object.keys(options)}
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
                    label={intl.formatMessage({
                        id: 'details.scopedSystemGraph.toolbar.search.label',
                    })}
                    size="small"
                    variant="outlined"
                />
            )}
            sx={{ width: 300 }}
        />
    );
}

export default NodeSearch;
