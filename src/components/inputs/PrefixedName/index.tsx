import type { PrefixedNameProps } from 'src/components/inputs/PrefixedName/types';

import { useMemo } from 'react';

import {
    FormControl,
    FormHelperText,
    Input,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
} from '@mui/material';

import { capitalize } from 'lodash';
import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import PrefixSelector from 'src/components/inputs/PrefixedName/PrefixSelector';
import useValidatePrefix from 'src/components/inputs/PrefixedName/useValidatePrefix';
import AlertBox from 'src/components/shared/AlertBox';
import { hasLength } from 'src/utils/misc-utils';

// const UNCLEAN_PATH_RE = new RegExp(/[^a-zA-Z0-9-_.]\.{1,2}\/?/g);
const DESCRIPTION_ID = 'prefixed-name-description';
const INPUT_ID = 'prefixed-name-input';

// eslint-disable-next-line complexity
function PrefixedName({
    allowBlankName,
    allowEndSlash,
    defaultPrefix,
    disabled,
    entityType,
    hideErrorMessage,
    label,
    onChange,
    onNameChange,
    onPrefixChange,
    prefixOnly,
    required,
    showDescription,
    size,
    standardVariant,
    validateOnLoad,
    value,
}: PrefixedNameProps) {
    // Hooks
    const intl = useIntl();

    const {
        errors,
        handlers,
        name,
        nameError,
        objectRoles,
        prefix,
        prefixError,
        singleOption,
        updateErrors,
    } = useValidatePrefix({
        allowBlankName,
        allowEndSlash,
        defaultPrefix,
        onChange,
        onNameChange,
        onPrefixChange,
        prefixOnly,
    });

    // For rendering input as MUI splits up variants between components
    const InputComponent = standardVariant ? Input : OutlinedInput;
    const showErrors = !hideErrorMessage && Boolean(errors);
    const variantString = standardVariant ? 'standard' : 'outlined';

    // For rendering help and errors - based on JSONForms approach
    const description = useMemo(() => {
        if (!showDescription) {
            return null;
        }

        const messageKey =
            singleOption || prefix.length > 0
                ? entityType
                    ? 'prefixedName.description.singlePrefix'
                    : 'prefixedName.description.singlePrefix.noEntityType'
                : name.length > 0
                  ? 'prefixedName.description.noPrefix'
                  : 'prefixedName.description';

        return intl.formatMessage(
            { id: messageKey },
            { entityType: entityType ? capitalize(entityType) : null }
        );
    }, [
        entityType,
        intl,
        name.length,
        prefix.length,
        showDescription,
        singleOption,
    ]);

    const firstFormHelperText = description
        ? description
        : showErrors
          ? errors
          : null;
    const secondFormHelperText = description && showErrors ? errors : null;

    // If needed we will validate on load. This is mainly just for
    //      the details form right now
    useMount(() => {
        if (!disabled && validateOnLoad) {
            const { nameErrors, prefixErrors, errorString } = updateErrors(
                prefix,
                name
            );
            if (onChange) {
                onChange(`${prefix}${name}`, errorString, {
                    prefix: prefixErrors,
                    name: nameErrors,
                });
            }
        }
    });

    // If in read only mode then just display the value in a normal input
    //      This makes it easier on the UI as we do not need to parse the
    //      value and figure out what portion is an object role
    if (disabled && value) {
        return (
            <TextField
                disabled
                fullWidth
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
                {intl.formatMessage({
                    id: 'custom.prefixedName.noAccessGrants',
                })}
            </AlertBox>
        );
    }

    if (prefixOnly) {
        return (
            <FormControl
                error={Boolean(prefixError)}
                fullWidth
                variant={variantString}
                sx={{
                    '& .MuiFormHelperText-root.Mui-error': {
                        whiteSpace: 'break-spaces',
                    },
                }}
            >
                <PrefixSelector
                    disabled={disabled}
                    error={Boolean(prefixError)}
                    label={label}
                    labelId={INPUT_ID}
                    onChange={(newValue) => handlers.setPrefix(newValue)}
                    options={objectRoles}
                    value={prefix}
                    variantString={variantString}
                />

                <FormHelperText
                    id={DESCRIPTION_ID}
                    error={showErrors ? !description : undefined}
                >
                    {firstFormHelperText}
                </FormHelperText>
            </FormControl>
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
            {label ? (
                <InputLabel
                    disabled={disabled}
                    focused
                    required={required}
                    htmlFor={INPUT_ID}
                    variant={variantString}
                >
                    {label}
                </InputLabel>
            ) : null}

            <InputComponent
                aria-describedby={description ? DESCRIPTION_ID : undefined}
                disabled={disabled}
                error={Boolean(nameError)}
                id={INPUT_ID}
                label={label}
                required={!allowBlankName}
                value={name}
                size={size ?? 'small'}
                sx={{
                    'borderRadius': 3,
                    [`& .MuiInputAdornment-root,
                      & .MuiInputAdornment-root .MuiAutocomplete-root `]: {
                        width: allowBlankName ? '100%' : undefined,
                    },
                    // Gross - but prevents the name input from showing a border while inside another border
                    '& div > div > fieldset.MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                    },
                }}
                onChange={(event) => {
                    handlers.setName(event.target.value);
                }}
                startAdornment={
                    <InputAdornment
                        //  This makes it so if a user clicks on the tenant name the input gets focus
                        style={
                            singleOption ? { pointerEvents: 'none' } : undefined
                        }
                        position="start"
                    >
                        {singleOption ? (
                            prefix
                        ) : (
                            <PrefixSelector
                                disabled={disabled}
                                error={Boolean(prefixError)}
                                label={null} // No label as we render it manually up above
                                labelId={INPUT_ID}
                                onChange={(newValue) =>
                                    handlers.setPrefix(newValue)
                                }
                                options={objectRoles}
                                value={prefix}
                                variantString={variantString}
                            />
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
