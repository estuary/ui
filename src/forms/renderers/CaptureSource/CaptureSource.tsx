import {
    Autocomplete,
    Box,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material';
import useConnectors from 'hooks/useConnectors';
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
    const { isFetchingConnectors, fetchingConnectorsError, connectors } =
        useConnectors();

    const { id, updateValue, errors } = props;
    let inputError: string;

    if (fetchingConnectorsError) {
        inputError = fetchingConnectorsError;
    } else if (errors !== '') {
        inputError = errors;
    }

    if (connectors.length === 0) {
        return <Skeleton variant="rectangular" height={40} width="auto" />;
    } else {
        return (
            <Autocomplete
                id={id}
                options={connectors}
                autoHighlight
                openOnFocus
                blurOnSelect="mouse"
                noOptionsText={intl.formatMessage({
                    id: 'common.errors.source.missing',
                })}
                loading={isFetchingConnectors}
                onChange={(event, reason: any) => {
                    updateValue(reason.key ? reason.key : '');
                }}
                getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.label
                }
                renderOption={(renderProps, option: any) => (
                    <Box
                        component="li"
                        key={`sourceTypeSelect-${option.key}`}
                        {...renderProps}
                    >
                        {option.label}
                    </Box>
                )}
                renderInput={(params) => (
                    <>
                        <TextField
                            {...params}
                            label={intl.formatMessage({
                                id:
                                    fetchingConnectorsError === null
                                        ? 'capturesource.label'
                                        : 'capturesource.fetch.failed',
                            })}
                            error={inputError.length > 0}
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
