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
    SelectChangeEvent,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { concat } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';

type ErrorStates = 'missing' | 'invalid' | 'unclean';
type Errors = ErrorStates[] | null;

interface Props {
    label: string;
    onChange: (
        prefixedName: string,
        errorString: string | null,
        errorTypes: Errors
    ) => void;
    onNameChange?: (name: string, errors: Errors) => void;
    onPrefixChange?: (prefix: string, errors: Errors) => void;
    allowBlankName?: boolean;
    defaultPrefix?: boolean;
    description?: string;
    required?: boolean;
    standardVariant?: boolean;
}

const NAME_RE = new RegExp(`^(${PREFIX_NAME_PATTERN}/?)*$`);
// const UNCLEAN_PATH_RE = new RegExp(/[^a-zA-Z0-9-_.]\.{1,2}\/?/g);
const DESCRIPTION_ID = 'prefixed-name-description';
const INPUT_ID = 'prefixed-name-input';

const validateInput = (value: string, allowBlank?: boolean): Errors => {
    if (!allowBlank && !hasLength(value)) {
        return ['missing'];
    }

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
    label,
    description,
    allowBlankName,
    onChange,
    onNameChange,
    onPrefixChange,
    defaultPrefix,
    required,
    standardVariant,
}: Props) {
    const InputComponent = standardVariant ? Input : OutlinedInput;

    const intl = useIntl();

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);
    const singleOption = objectRoles.length === 1;

    const [prefix, setPrefix] = useState('');
    const [prefixError, setPrefixError] = useState<Errors>(null);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<Errors>(null);
    const [errors, setErrors] = useState<string | null>(null);

    const updateErrors = (prefixValue: string, nameValue: string) => {
        const prefixErrors = validateInput(prefixValue, false);
        const nameErrors = validateInput(nameValue, allowBlankName);

        setPrefixError(prefixErrors);
        setNameError(nameErrors);

        return [prefixErrors, nameErrors];
    };

    const handlers = {
        setPrefix: (event: SelectChangeEvent<string>) => {
            const value = event.target.value;
            const { 0: error } = updateErrors(value, name);

            setPrefix(value);
            if (onNameChange) {
                onNameChange(value, error);
            }
        },
        setName: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const value = event.target.value;
            const processedValue = value.replaceAll(/\s/g, '_');
            const { 1: error } = updateErrors(prefix, processedValue);

            setName(processedValue);
            if (onPrefixChange) {
                onPrefixChange(processedValue, error);
            }
        },
    };

    useMount(() => {
        if (singleOption || defaultPrefix) {
            setPrefix(objectRoles[0]);
        }
    });

    useEffect(() => {
        const updatedErrors: string[] = [];
        const generateErrorList = (inputName: string, inputErrors: Errors) => {
            inputErrors?.forEach((inputError) => {
                updatedErrors.push(
                    intl.formatMessage({
                        id: `custom.prefixedName.${inputName}.${inputError}`,
                    })
                );
            });
        };

        if (nameError) {
            generateErrorList('name', nameError);
        }

        if (prefixError) {
            generateErrorList('prefix', prefixError);
        }

        const errorString = hasLength(updatedErrors)
            ? updatedErrors.join(' ')
            : null;
        setErrors(errorString);

        onChange(
            `${prefix}${name}`,
            errorString,
            concat([], nameError ?? [], prefixError ?? [])
        );
    }, [onChange, name, prefix, nameError, prefixError, intl]);

    const firstFormHelperText = description
        ? description
        : errors
        ? errors
        : null;
    const secondFormHelperText = description && errors ? errors : null;

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
                id={INPUT_ID}
                label={label}
                notched
                onChange={handlers.setName}
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
                                onChange={handlers.setPrefix}
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
                error={Boolean(errors) ? !description : undefined}
            >
                {firstFormHelperText}
            </FormHelperText>
            <FormHelperText error={Boolean(errors)}>
                {secondFormHelperText}
            </FormHelperText>
        </FormControl>
    );
}

export default PrefixedName;
