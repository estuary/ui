import { Autocomplete, TextField } from '@mui/material';
import { Box } from '@mui/system';
import PropTypes from 'prop-types';

const SourceTypePropTypes = {
    id: PropTypes.string.isRequired,
};
SourceTypeSelect.propTypes = SourceTypePropTypes;
type SourceTypeProps = PropTypes.InferProps<typeof SourceTypePropTypes>;

const sourceTypes = [
    {
        label: 'Iterable',
        key: 'prefix_iterable_source_v-1.1.1',
    },
    {
        label: 'Google Sheets',
        key: 'prefix_Google-Sheets_source_v-1.1.1',
    },
    {
        label: 'MySQL',
        key: 'prefix_my-sql_source_v-1.1.1',
    },
    {
        label: 'Shopify',
        key: 'prefix_Shopify_source_v-1.1.1',
    },
    {
        label: 'Lorem',
        key: 'prefix_Lorem_source_v-1.1.1',
    },
    {
        label: 'Ipsum',
        key: 'prefix_Ipsum_source_v-1.1.1',
    },
];

function SourceTypeSelect(props: SourceTypeProps) {
    return (
        <Autocomplete
            id={props.id}
            sx={{ width: 300 }}
            options={sourceTypes}
            autoHighlight
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => (
                <Box component="li" {...props}>
                    {option.label}
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Source type"
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                    }}
                />
            )}
        />
    );
}

export default SourceTypeSelect;
