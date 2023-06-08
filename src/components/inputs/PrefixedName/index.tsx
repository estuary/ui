import {
    Box,
    FormControl,
    FormHelperText,
    Input,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import { PrefixedName_Errors, PrefixedName_OnChange } from './types';

export interface Props {
    label: string;
    onChange: PrefixedName_OnChange;
    onNameChange?: (name: string, errors: PrefixedName_Errors) => void;
    onPrefixChange?: (prefix: string, errors: PrefixedName_Errors) => void;
    allowBlankName?: boolean;
    allowEndSlash?: boolean;
    defaultPrefix?: boolean;
    description?: string;
    hideErrorMessage?: boolean;
    required?: boolean;
    standardVariant?: boolean;
    validateOnLoad?: boolean;
}

// const UNCLEAN_PATH_RE = new RegExp(/[^a-zA-Z0-9-_.]\.{1,2}\/?/g);
const DESCRIPTION_ID = 'prefixed-name-description';
const INPUT_ID = 'prefixed-name-input';

const validateInput = (
    value: string,
    allowBlank?: boolean,
    allowEndSlash?: boolean
): PrefixedName_Errors => {
    if (!allowBlank && !hasLength(value)) {
        return ['missing'];
    }

    const NAME_RE = new RegExp(
        `^(${PREFIX_NAME_PATTERN}/)*${PREFIX_NAME_PATTERN}${
            allowEndSlash ? '/?' : ''
        }$`
    );
    if (!NAME_RE.test(value)) {
        return ['invalid'];
    }

    // TODO (naming) need to check for unclean paths
    // if (
    //     value === '.' ||
    //     value === './' ||
    //     value === '..' ||
    //     value === '../' ||
    //     UNCLEAN_PATH_RE.test(value)
    // ) {
    //     return ['unclean'];
    // }

    return null;
};

function PrefixedName({
    allowBlankName,
    allowEndSlash,
    defaultPrefix,
    description,
    hideErrorMessage,
    label,
    onChange,
    onNameChange,
    onPrefixChange,
    required,
    standardVariant,
    validateOnLoad,
}: Props) {
    // Hooks
    const intl = useIntl();

    // Store stuff
    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);
    const singleOption = objectRoles.length === 1;

    // Local State
    const [errors, setErrors] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<PrefixedName_Errors>(null);
    const [prefix, setPrefix] = useState(
        singleOption || defaultPrefix ? objectRoles[0] : ''
    );
    const [prefixError, setPrefixError] = useState<PrefixedName_Errors>(null);

    // Local vars for rendering
    const InputComponent = standardVariant ? Input : OutlinedInput;
    const showErrors = !hideErrorMessage && Boolean(errors);
    const firstFormHelperText = description
        ? description
        : showErrors
        ? errors
        : null;
    const secondFormHelperText = description && showErrors ? errors : null;

    const updateErrors = (prefixValue: string, nameValue: string) => {
        // Validate both inputs
        const prefixErrors = validateInput(prefixValue, false, true);
        const nameErrors = validateInput(
            nameValue,
            allowBlankName,
            allowEndSlash
        );

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
        if (nameErrors) {
            generateErrorList('name', nameErrors);
        }

        // Generate the string by concat with space.
        //  Follows the style of JSONForms
        const errorString = hasLength(updatedErrors)
            ? updatedErrors.join(' \n')
            : null;

        // Set the local state
        setErrors(errorString);
        setPrefixError(prefixErrors);
        setNameError(nameErrors);

        return [prefixErrors, nameErrors];
    };

    const handlers = {
        setPrefix: (value: string) => {
            console.log('setPrefix');
            const { 0: error } = updateErrors(value, name);

            setPrefix(value);
            if (onPrefixChange) {
                onPrefixChange(value, error);
            }
        },
        setName: (value: string) => {
            console.log('setName');
            const processedValue = value.replaceAll(/\s/g, '_');
            const { 1: error } = updateErrors(prefix, processedValue);

            setName(processedValue);
            if (onNameChange) {
                onNameChange(processedValue, error);
            }
        },
    };

    useEffect(() => {
        onChange(`${prefix}${name}`, errors, {
            prefix: prefixError,
            name: nameError,
        });
    }, [errors, name, nameError, onChange, prefix, prefixError]);

    useMount(() => {
        if (validateOnLoad) {
            console.log('updating error');
            updateErrors(prefix, name);
        }
    });

    if (!hasLength(objectRoles)) {
        return (
            <AlertBox short severity="warning">
                <FormattedMessage id="custom.prefixedName.noAccessGrants" />
            </AlertBox>
        );
    }

    return (
        <FormControl fullWidth error={Boolean(errors)} variant="outlined">
            <InputLabel
                focused
                required={required}
                htmlFor={INPUT_ID}
                variant="outlined"
            >
                {label}
            </InputLabel>
            <InputComponent
                aria-describedby={description ? DESCRIPTION_ID : undefined}
                error={Boolean(nameError)}
                id={INPUT_ID}
                label={label}
                onChange={(event) => {
                    handlers.setName(event.target.value);
                }}
                required={!allowBlankName}
                size="small"
                sx={{ borderRadius: 3 }}
                value={name}
                startAdornment={
                    <InputAdornment position="start">
                        {singleOption ? (
                            <Box>{prefix}</Box>
                        ) : (
                            <Select
                                size="small"
                                variant="standard"
                                value={prefix}
                                disableUnderline
                                error={Boolean(prefixError)}
                                onChange={(event) => {
                                    handlers.setPrefix(event.target.value);
                                }}
                                required
                                sx={{
                                    '& .MuiSelect-select': {
                                        paddingBottom: 0.2,
                                    },
                                }}
                            >
                                {objectRoles.map((value) => (
                                    <MenuItem key={value} value={value}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    </InputAdornment>
                }
            />
            <FormHelperText
                id={DESCRIPTION_ID}
                error={showErrors ? !description : undefined}
            >
                {firstFormHelperText}
            </FormHelperText>
            <FormHelperText error={showErrors}>
                {secondFormHelperText}
            </FormHelperText>
        </FormControl>
    );
}

export default PrefixedName;
