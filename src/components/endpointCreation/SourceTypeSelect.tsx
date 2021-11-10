import { Autocomplete, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const SourceTypePropTypes = {
    id: PropTypes.string.isRequired,
    onSourceChange: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
};
SourceTypeSelect.propTypes = SourceTypePropTypes;
type SourceTypeProps = PropTypes.InferProps<typeof SourceTypePropTypes>;

function SourceTypeSelect(props: SourceTypeProps) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [sourceTypes, setSourceTypes] = useState([]);

    // Note: the empty deps array [] means
    // this useEffect will run once
    // similar to componentDidMount()
    useEffect(() => {
        fetch('http://localhost:3001/sources/all')
            .then((res) => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setSourceTypes(result);
                },
                (error) => {
                    console.warn(
                        'There was an issue fetching the Source Types',
                        error.stack
                    );
                    setIsLoaded(true);
                    setError(error.message);
                }
            );
    }, []);

    return (
        <>
            <Autocomplete
                id={props.id}
                sx={{ width: 300 }}
                options={sourceTypes}
                autoHighlight
                openOnFocus
                blurOnSelect="mouse"
                noOptionsText={
                    error !== null
                        ? 'Unable to fetch source types'
                        : 'No Options'
                }
                loading={!isLoaded}
                onChange={function (event, reason: any) {
                    if (reason !== null) {
                        const key = reason.key;
                        props.onSourceChange(key);
                    } else {
                        props.onSourceChange('');
                    }
                }}
                renderOption={(props, option: any) => (
                    <Box component="li" {...props}>
                        {option.label}
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Source type"
                        error={error !== null}
                        inputProps={{
                            ...params.inputProps,
                            autoComplete: 'new-password', // disable autocomplete and autofill
                        }}
                    />
                )}
            />

            {error !== null ? (
                <Box border="solid" p={2}>
                    <Typography variant="subtitle1">
                        Whoops! There was an error. Maybe this will help:
                    </Typography>
                    <Typography variant="body2"> {error} </Typography>
                </Box>
            ) : null}
        </>
    );
}

export default SourceTypeSelect;
