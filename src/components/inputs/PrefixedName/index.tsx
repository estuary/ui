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
    TextField,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import { PrefixedName_Change, PrefixedName_Errors } from './types';

export interface Props {
    label: string;
    onChange: PrefixedName_Change;
    allowBlankName?: boolean;
    allowEndSlash?: boolean;
    defaultPrefix?: boolean;
    description?: string;
    disabled?: boolean;
    hideErrorMessage?: boolean;
    onNameChange?: PrefixedName_Change;
    onPrefixChange?: PrefixedName_Change;
    required?: boolean;
    standardVariant?: boolean;
    validateOnLoad?: boolean;
    value?: string;
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
    disabled: readOnly,
    required,
    standardVariant,
    validateOnLoad,
    value,
}: Props) {
    // Hooks
    const intl = useIntl();

    // Store stuff
    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);
    const singleOption = objectRoles.length === 1;

    // Local State for editing
    const [errors, setErrors] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<PrefixedName_Errors>(null);
    const [prefix, setPrefix] = useState(
        singleOption || defaultPrefix ? objectRoles[0] : ''
    );
    const [prefixError, setPrefixError] = useState<PrefixedName_Errors>(null);

    // For rendering input as MUI splits up variants between components
    const InputComponent = standardVariant ? Input : OutlinedInput;
    const showErrors = !hideErrorMessage && Boolean(errors);
    const variantString = standardVariant ? 'standard' : 'outlined';

    // For rendering help and errors - based on JSONForms approach
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

        return { prefixErrors, nameErrors, errorString };
    };

    const handlers = {
        setPrefix: (prefixValue: string) => {
            const { nameErrors, prefixErrors, errorString } = updateErrors(
                prefixValue,
                name
            );

            setPrefix(prefixValue);
            onChange(`${prefixValue}${name}`, errorString, {
                prefix: prefixErrors,
                name: nameErrors,
            });
            if (onPrefixChange) {
                onPrefixChange(prefixValue, errorString, {
                    prefix: prefixErrors,
                    name: nameError,
                });
            }
        },
        setName: (nameValue: string) => {
            // We don't allow spaces in names but users keep trying
            //      so making it easier on them and just replacing
            const processedValue = nameValue.replaceAll(/\s/g, '_');
            const { nameErrors, prefixErrors, errorString } = updateErrors(
                prefix,
                processedValue
            );

            setName(processedValue);
            onChange(`${prefix}${processedValue}`, errorString, {
                prefix: prefixErrors,
                name: nameErrors,
            });

            if (onNameChange) {
                onNameChange(processedValue, errorString, {
                    prefix: prefixError,
                    name: nameError,
                });
            }
        },
    };

    // If needed we will validate on load. This is mainly just for
    //      the details form right now
    useMount(() => {
        if (!readOnly && validateOnLoad) {
            const { nameErrors, prefixErrors, errorString } = updateErrors(
                prefix,
                name
            );
            onChange(`${prefix}${name}`, errorString, {
                prefix: prefixErrors,
                name: nameErrors,
            });
        }
    });

    // If in read only mode then just display the value in a normal input
    //      This makes it easier on the UI as we do not need to parse the
    //      value and figure out what portion is an object role
    if (readOnly && value) {
        return (
            <TextField
                disabled
                variant={variantString}
                label={label}
                helperText={description}
                value={value}
            />
        );
    }

    // Let the user know they cannot enter a name due to not having access
    if (!hasLength(objectRoles)) {
        return (
            <AlertBox short severity="warning">
                <FormattedMessage id="custom.prefixedName.noAccessGrants" />
            </AlertBox>
        );
    }

    return (
        <FormControl
            error={Boolean(errors)}
            fullWidth
            variant={variantString}
            sx={{
                '& .MuiFormHelperText-root.Mui-error': {
                    whiteSpace: 'break-spaces',
                },
            }}
        >
            <InputLabel
                disabled={readOnly}
                focused
                required={required}
                htmlFor={INPUT_ID}
                variant={variantString}
            >
                {label}
            </InputLabel>
            <InputComponent
                aria-describedby={description ? DESCRIPTION_ID : undefined}
                disabled={readOnly}
                error={Boolean(nameError)}
                id={INPUT_ID}
                label={label}
                required={!allowBlankName}
                size="small"
                value={name}
                sx={{ borderRadius: 3 }}
                onChange={(event) => {
                    handlers.setName(event.target.value);
                }}
                startAdornment={
                    <InputAdornment position="start">
                        {singleOption ? (
                            <Box>{prefix}</Box>
                        ) : (
                            <Select
                                disabled={readOnly}
                                disableUnderline
                                error={Boolean(prefixError)}
                                required
                                size="small"
                                value={prefix}
                                variant="standard"
                                sx={{
                                    'minWidth': 75,
                                    '& .MuiSelect-select': {
                                        paddingBottom: 0.2,
                                    },
                                }}
                                onChange={(event) => {
                                    handlers.setPrefix(event.target.value);
                                }}
                            >
                                {objectRoles.map((objectRole) => (
                                    <MenuItem
                                        key={objectRole}
                                        value={objectRole}
                                    >
                                        {objectRole}
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
