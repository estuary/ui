import {
    Autocomplete,
    Box,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material';
import useSourceTypes from 'hooks/useSourceTypes';
import React from 'react';
import { useIntl } from 'react-intl';

interface CaptureSourceProps {
    id?: string;
    value: number;
    updateValue: (newValue: any) => void;
    errors: string;
}

export const CaptureSource: React.FC<CaptureSourceProps> = (props) => {
    const intl = useIntl();
    const { isFetching, error, sourceTypes } = useSourceTypes();

    const { id, updateValue, errors } = props;
    let inputError: string;

    if (error) {
        inputError = error;
    } else if (errors !== '') {
        inputError = errors;
    }

    if (sourceTypes === null) {
        return <Skeleton variant="rectangular" height={40} width={'auto'} />;
    } else {
        return (
            <Autocomplete
                id={id}
                options={sourceTypes}
                autoHighlight
                openOnFocus
                blurOnSelect="mouse"
                noOptionsText={intl.formatMessage({
                    id: 'common.errors.source.missing',
                })}
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
                        foo - {option.label}
                    </Box>
                )}
                renderInput={(params) => (
                    <>
                        <TextField
                            {...params}
                            label={intl.formatMessage({
                                id:
                                    error !== null
                                        ? 'capturesource.fetch.failed'
                                        : 'capturesource.label',
                            })}
                            error={inputError !== null}
                            required={true}
                            inputProps={{
                                ...params.inputProps,
                                autoComplete: 'off',
                            }}
                        />
                        <Typography variant="caption" color="red">
                            {inputError}
                        </Typography>
                    </>
                )}
            />
        );
    }
};
