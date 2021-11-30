import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import * as React from 'react';

const CaptureNamePropTypes = {
    id: PropTypes.string.isRequired,
    onValueChange: PropTypes.func.isRequired,
    tenant: PropTypes.string,
};
CaptureName.propTypes = CaptureNamePropTypes;
type CaptureNameProps = PropTypes.InferProps<typeof CaptureNamePropTypes>;

interface TenantType {
    name: string;
    index: number;
}

export default function CaptureName(props: CaptureNameProps) {
    const [value, setValue] = React.useState<TenantType | null>(null);
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
                        .get(`http://localhost:3001/tenants`, {
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
                500
            ),
        []
    );

    React.useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setOptions([]);
        } else {
            fetch({ input: inputValue }, (results?: readonly TenantType[]) => {
                if (active) {
                    setOptions(results ? results : []);
                }
            });
        }

        return () => {
            active = false;
        };
    }, [value, inputValue, fetch]);

    return (
        <Autocomplete
            id={props.id}
            sx={{ width: 300 }}
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            disableClearable
            freeSolo
            getOptionLabel={(option) => option.name}
            onChange={(event: any, newValue: any) => {
                setValue(newValue ? newValue : null);
                setInputValue(newValue ? newValue.name : '');
                props.onValueChange(newValue ? newValue.name : '');
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            isOptionEqualToValue={(option: TenantType, value: TenantType) => {
                return option.name === value.name;
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Capture Name"
                    required={true}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password',
                    }}
                />
            )}
            renderOption={(props, option) => {
                return (
                    <li {...props}>
                        <Typography variant="body2" color="text.secondary">
                            {option.name}
                        </Typography>
                    </li>
                );
            }}
        />
    );
}
