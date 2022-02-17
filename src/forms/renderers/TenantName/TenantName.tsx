import { Autocomplete, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { throttle } from 'lodash';
import React from 'react';

interface TenantNameProps {
    id?: string;
    value: number;
    updateValue: (newValue: any) => void;
}

interface TenantType {
    name: string;
    index: number;
}

export const TenantName: React.FC<TenantNameProps> = (props) => {
    const { id, updateValue } = props;

    const [isLookupEnabled, setIsLookupEnabled] = React.useState(true);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<readonly TenantType[]>([]);

    const fetch = React.useMemo(
        () =>
            throttle(
                (
                    request: { input: string },
                    callback: (results?: readonly TenantType[]) => void
                ) => {
                    axios
                        .get(`http://localhost:3001/test-tenants`, {
                            params: { s: request.input },
                        })
                        .then(
                            (response) => {
                                callback(response.data);
                            },
                            (error) => {
                                console.log('Error ', error);
                            }
                        );
                },
                750
            ),
        []
    );

    React.useEffect(() => {
        let active = true;
        console.log('useEffect');
        if (inputValue === '') {
            console.log('useEffect1');
            setOptions([]);
        } else {
            console.log('useEffect2', isLookupEnabled);
            if (isLookupEnabled) {
                fetch(
                    { input: inputValue },
                    (results?: readonly TenantType[]) => {
                        if (active) {
                            setOptions(results ? results : []);
                        }
                    }
                );
            } else {
                setOptions([]);
            }
        }

        return () => {
            active = false;
        };
    }, [inputValue, fetch, isLookupEnabled]);

    return (
        <Autocomplete
            id={id}
            options={options}
            filterSelectedOptions
            getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.name
            }
            onChange={(event: any, newValue: any) => {
                console.log('onchange');
                if (newValue === null) {
                    console.log('onchange1');
                    setIsLookupEnabled(true);
                } else {
                    console.log('onchange2');
                    setInputValue(newValue.name);
                    setIsLookupEnabled(false);
                }
            }}
            onInputChange={(event, newInputValue) => {
                console.log('onInputChange');
                setInputValue(newInputValue);
                updateValue(newInputValue);
            }}
            isOptionEqualToValue={(
                option: TenantType,
                givenValue: TenantType
            ) => {
                return option.name === givenValue.name;
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Tenant"
                    placeholder="acmeCo"
                    required={true}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'off',
                    }}
                />
            )}
            renderOption={(renderProps, option) => {
                return (
                    <li {...renderProps}>
                        <Typography variant="body2" color="text.secondary">
                            {option.name}
                        </Typography>
                    </li>
                );
            }}
        />
    );
};
