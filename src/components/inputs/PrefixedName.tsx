import {
    InputAdornment,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { concat } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
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
}

const NAME_RE = new RegExp(`^(${PREFIX_NAME_PATTERN}/?)*$`);

const validateInput = (value: string, allowBlank?: boolean): Errors => {
    if (allowBlank && !hasLength(value)) {
        return ['missing'];
    }

    if (!NAME_RE.test(value)) {
        return ['invalid'];
    }

    return null;
};

function PrefixedName({
    label,
    allowBlankName,
    onChange,
    onNameChange,
    onPrefixChange,
    defaultPrefix,
}: Props) {
    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);
    const singleOption = objectRoles.length === 1;

    const [prefix, setPrefix] = useState(
        singleOption || defaultPrefix ? objectRoles[0] : ''
    );
    const [prefixError, setPrefixError] = useState<Errors>(null);

    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<Errors>(null);

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

    useEffect(() => {
        onChange(prefix + name, concat([], nameError ?? [], prefixError ?? []));
    }, [onChange, name, prefix, nameError, prefixError]);

    if (!hasLength(objectRoles)) {
        return (
            <AlertBox short severity="warning">
                <FormattedMessage id="custom.prefixedName.noAccessGrants" />
            </AlertBox>
        );
    }

    return (
        <TextField
            InputProps={{
                startAdornment: (
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
                ),
                sx: { borderRadius: 3 },
            }}
            label={label}
            value={name}
            variant="outlined"
            size="small"
            error={Boolean(nameError)}
            onChange={handlers.setName}
            sx={{ flexGrow: 1 }}
        />
    );
}

export default PrefixedName;
