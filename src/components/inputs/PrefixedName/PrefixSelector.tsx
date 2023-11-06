import { InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength } from 'utils/misc-utils';
import { validateCatalogName } from './shared';
import { PrefixedName_Change, PrefixedName_Errors } from './types';

interface Props {
    label: string | null;
    onChange: PrefixedName_Change;
    defaultPrefix?: boolean;
    disabled?: boolean;
    prefixOnly?: boolean;
}

const INPUT_ID = 'prefix-input';

// TODO (prefixed name) this is not used right now but will be soon.
//  need to break out the selector for when we allow prefixed name
//  to not include the prefix we aren't doing processing we don't need
function PrefixSelector({
    label,
    onChange,
    defaultPrefix,
    disabled,
    prefixOnly,
}: Props) {
    const intl = useIntl();

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);
    const singleOption = objectRoles.length === 1;

    const [prefix, setPrefix] = useState(
        singleOption || defaultPrefix ? objectRoles[0] : ''
    );
    const [prefixError, setPrefixError] = useState<PrefixedName_Errors>(null);

    const updateErrors = (prefixValue: string) => {
        // Validate input
        const prefixErrors = validateCatalogName(prefixValue, false, true);

        // Array to keep list of errors in by going through each returned
        //  error and populating with the translated message
        const updatedErrors: string[] = [];
        const generateErrorList = (
            inputName: string,
            inputErrors: PrefixedName_Errors
        ) => {
            inputErrors?.forEach((inputError) => {
                updatedErrors.push(
                    intl.formatMessage({
                        id: `custom.prefixedName.${inputName}.${inputError}`,
                    })
                );
            });
        };

        // If there are any errors then populate the list
        if (prefixErrors) {
            generateErrorList('prefix', prefixErrors);
        }

        // Generate the string by concat with space.
        //  Follows the style of JSONForms
        const errorString = hasLength(updatedErrors)
            ? updatedErrors.join(' \n')
            : null;

        // Set the local state
        // setErrors(errorString);
        setPrefixError(prefixErrors);

        return { prefixErrors, errorString };
    };

    const updatePrefix = (prefixValue: string) => {
        const { prefixErrors, errorString } = updateErrors(prefixValue);

        setPrefix(prefixValue);
        onChange(prefixValue, errorString, { prefix: prefixErrors });
    };

    return prefixOnly ? (
        <>
            <InputLabel
                color="secondary"
                disabled={disabled}
                focused
                htmlFor={INPUT_ID}
                required
                variant="outlined"
                sx={{
                    'top': -6,
                    '&.MuiInputLabel-shrink': {
                        top: 0,
                    },
                }}
            >
                {label}
            </InputLabel>

            <Select
                label={label}
                labelId={INPUT_ID}
                disabled={disabled}
                error={Boolean(prefixError)}
                required
                size="small"
                value={prefix}
                variant="outlined"
                sx={{
                    minWidth: 75,
                    borderRadius: 3,
                }}
                onChange={(event) => {
                    updatePrefix(event.target.value);
                }}
            >
                {objectRoles.map((objectRole) => (
                    <MenuItem key={objectRole} value={objectRole}>
                        {objectRole}
                    </MenuItem>
                ))}
            </Select>
        </>
    ) : (
        <Select
            disabled={disabled}
            disableUnderline
            error={Boolean(prefixError)}
            required
            size="small"
            value={prefix}
            variant="standard"
            sx={{
                'minWidth': 75,
                '& .MuiSelect-select': {
                    pb: 0.2,
                },
            }}
            onChange={(event) => {
                updatePrefix(event.target.value);
            }}
        >
            {objectRoles.map((objectRole) => (
                <MenuItem key={objectRole} value={objectRole}>
                    {objectRole}
                </MenuItem>
            ))}
        </Select>
    );
}

export default PrefixSelector;
