import { Autocomplete, Box, TextField } from '@mui/material';
import { useSourceTypes } from 'hooks/useSourceTypes';
import React from 'react';

interface CaptureSourceProps {
    id?: string;
    value: number;
    updateValue: (newValue: any) => void;
}

export const CaptureSource: React.FC<CaptureSourceProps> = (props) => {
    const { id, updateValue } = props;
    const { isFetching, error, sourceTypes } = useSourceTypes();

    if (sourceTypes === null) {
        return <>loading</>;
    } else {
        return (
            <Autocomplete
                id={id}
                options={sourceTypes}
                autoHighlight
                openOnFocus
                blurOnSelect="mouse"
                noOptionsText="No sources found."
                loading={isFetching}
                onChange={function (event, reason: any) {
                    updateValue(reason.key ? reason.key : '');
                }}
                getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.label
                }
                renderOption={(props, option: any) => (
                    <Box
                        component="li"
                        key={`sourceTypeSelect-${option.key}`}
                        {...props}
                    >
                        {option.label}
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={
                            error !== null
                                ? 'Failed Fetching Source Type'
                                : 'Source type'
                        }
                        error={error !== null}
                        required={true}
                        inputProps={{
                            ...params.inputProps,
                            autoComplete: 'off',
                        }}
                    />
                )}
            />
        );
    }
};
