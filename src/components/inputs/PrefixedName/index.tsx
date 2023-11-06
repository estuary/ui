import {
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
import useValidatePrefix from 'components/inputs/PrefixedName/useValidatePrefix';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { hasLength } from 'utils/misc-utils';
import { PrefixedName_Change } from './types';

export interface Props {
    label: string | null;
    allowBlankName?: boolean;
    allowEndSlash?: boolean;
    defaultPrefix?: boolean;
    disabled?: boolean;
    hideErrorMessage?: boolean;
    onChange?: PrefixedName_Change;
    onNameChange?: PrefixedName_Change;
    onPrefixChange?: PrefixedName_Change;
    required?: boolean;
    showDescription?: boolean;
    size?: 'small' | 'medium';
    standardVariant?: boolean;
    prefixOnly?: boolean;
    validateOnLoad?: boolean;
    value?: string;
}

// const UNCLEAN_PATH_RE = new RegExp(/[^a-zA-Z0-9-_.]\.{1,2}\/?/g);
const DESCRIPTION_ID = 'prefixed-name-description';
const INPUT_ID = 'prefixed-name-input';

function PrefixedName({
    allowBlankName,
    allowEndSlash,
    defaultPrefix,
    disabled,
    hideErrorMessage,
    label,
    onChange,
    onNameChange,
    onPrefixChange,
    required,
    showDescription,
    size,
    standardVariant,
    prefixOnly,
    validateOnLoad,
    value,
}: Props) {
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
    });

    // For rendering input as MUI splits up variants between components
    const InputComponent = standardVariant ? Input : OutlinedInput;
    const showErrors = !hideErrorMessage && Boolean(errors);
    const variantString = standardVariant ? 'standard' : 'outlined';

    // For rendering help and errors - based on JSONForms approach
    const description = showDescription
        ? intl.formatMessage({
              id: singleOption
                  ? 'prefixedName.description.singlePrefix'
                  : 'prefixedName.description',
          })
        : null;
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
                        handlers.setPrefix(event.target.value);
                    }}
                >
                    {objectRoles.map((objectRole) => (
                        <MenuItem key={objectRole} value={objectRole}>
                            {objectRole}
                        </MenuItem>
                    ))}
                </Select>
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
                sx={{ borderRadius: 3 }}
                onChange={(event) => {
                    handlers.setName(event.target.value);
                }}
                startAdornment={
                    <InputAdornment position="start">
                        {singleOption ? (
                            prefix
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
