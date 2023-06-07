import {
    FormControl,
    FormControlProps,
    FormHelperText,
    Input,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { concat } from 'lodash';
import { ChangeEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUpdateEffect } from 'react-use';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';

type ErrorStates = 'missing' | 'invalid';
type Errors = ErrorStates[] | null;

interface Props {
    label: string;
    onChange: (prefixedName: string, errors: Errors) => void;
    onNameChange?: (name: string, errors: Errors) => void;
    onPrefixChange?: (prefix: string, errors: Errors) => void;
    allowBlankName?: boolean;
    defaultPrefix?: boolean;
    description?: string;
    required?: boolean;
    formControlProps?: FormControlProps;
}

const NAME_RE = new RegExp(`^(${PREFIX_NAME_PATTERN}/?)*$`);
const DESCRIPTION_ID = 'prefixed-name-description';
const INPUT_ID = 'prefixed-name-input';

const validateInput = (value: string, allowBlank?: boolean): Errors => {
    if (!allowBlank && !hasLength(value)) {
        return ['missing'];
    }

    if (!NAME_RE.test(value)) {
        return ['invalid'];
    }

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
    formControlProps,
}: Props) {
    const intl = useIntl();

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);
    const singleOption = objectRoles.length === 1;

    const [prefix, setPrefix] = useState(
        singleOption || defaultPrefix ? objectRoles[0] : ''
    );
    const [prefixError, setPrefixError] = useState<Errors>(null);

    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<Errors>(null);

    const [errors, setErrors] = useState<string | null>(null);

    const handlers = {
        setPrefix: (event: SelectChangeEvent<string>) => {
            const value = event.target.value;
            const error = validateInput(value, false);

            setPrefixError(error);
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
            const error = validateInput(processedValue, allowBlankName);

            setNameError(error);
            setName(processedValue);

            if (onPrefixChange) {
                onPrefixChange(processedValue, error);
            }
        },
    };

    useUpdateEffect(() => {
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
            generateErrorList('prefix', nameError);
        }

        setErrors(hasLength(updatedErrors) ? updatedErrors.join(' ') : null);

        onChange(
            `${prefix}${name}`,
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
        <FormControl fullWidth {...formControlProps} variant="outlined">
            <InputLabel
                error={Boolean(errors)}
                required={required}
                htmlFor={INPUT_ID}
            >
                {label}
            </InputLabel>
            <Input
                aria-describedby={description ? DESCRIPTION_ID : undefined}
                id={INPUT_ID}
                value={name}
                size="small"
                error={Boolean(errors)}
                onChange={handlers.setName}
                sx={{ borderRadius: 3 }}
                startAdornment={
                    <InputAdornment position="start">
                        {singleOption ? (
                            prefix
                        ) : (
                            <Select
                                size="small"
                                variant="standard"
                                value={prefix}
                                disableUnderline
                                error={Boolean(prefixError)}
                                onChange={handlers.setPrefix}
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
