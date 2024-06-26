import {
    Autocomplete,
    AutocompleteRenderInputParams,
    TextField,
} from '@mui/material';
import useNodeSearch from 'components/graphs/ScopedSystemGraph/useNodeSearch';
import { useIntl } from 'react-intl';

interface Props {
    disabled?: boolean;
}

function NodeSearch({ disabled }: Props) {
    const intl = useIntl();

    const { onSelectOption, searchOptions } = useNodeSearch();

    return (
        <Autocomplete
            disabled={disabled}
            filterOptions={(ids, { inputValue }) =>
                ids
                    .filter((id) => searchOptions[id].includes(inputValue))
                    .sort()
                    .slice(0, 10)
            }
            getOptionLabel={(id) => searchOptions[id]}
            onChange={onSelectOption}
            options={Object.keys(searchOptions)}
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
