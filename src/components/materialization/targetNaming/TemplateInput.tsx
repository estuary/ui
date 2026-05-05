import {
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
} from '@mui/material';

import { Code, InputField } from 'iconoir-react';
import { useIntl } from 'react-intl';

export interface TemplateInputProps {
    mode: 'fixed' | 'template';
    value: string;
    onChange: (value: string) => void;
    prefix: string;
    onPrefixChange: (v: string) => void;
    suffix: string;
    onSuffixChange: (v: string) => void;
    field?: 'schema' | 'table';
    onModeChange?: (mode: 'fixed' | 'template') => void;
    hideWhenFixed?: boolean;
    required?: boolean;
    tokenString?: string;
}

const FIELD_KEYS = {
    schema: {
        label: 'destinationLayout.dialog.schema.label',
        token: 'schema',
        useTemplate: 'destinationLayout.dialog.schema.useTemplate',
        useFixed: 'destinationLayout.dialog.schema.useFixed',
    },
    table: {
        label: 'destinationLayout.dialog.table.label',
        token: 'table',
        useTemplate: 'destinationLayout.dialog.table.useTemplate',
        useFixed: 'destinationLayout.dialog.table.useFixed',
    },
} as const;

export function TemplateInput({
    field = 'schema',
    mode,
    onModeChange,
    hideWhenFixed,
    required,
    value,
    onChange,
    prefix,
    onPrefixChange,
    suffix,
    onSuffixChange,
    tokenString,
}: TemplateInputProps) {
    const intl = useIntl();
    const keys = FIELD_KEYS[field];
    const tokenValue = tokenString ?? `{{${keys.token}}}`;

    console.log('object >>> ', {
        mode,
        onModeChange,
        hideWhenFixed,
        required,
        value,
        onChange,
        prefix,
        onPrefixChange,
        suffix,
        onSuffixChange,
        tokenString,
        tokenValue,
        keys,
    });

    // TODO (target naming) - probably just remove this before merging
    const adornment = onModeChange ? (
        <InputAdornment position="end">
            <Tooltip
                title={intl.formatMessage({
                    id: mode === 'template' ? keys.useFixed : keys.useTemplate,
                })}
                placement="right"
            >
                <IconButton
                    size="small"
                    edge="end"
                    onClick={() =>
                        onModeChange(mode === 'template' ? 'fixed' : 'template')
                    }
                >
                    {mode === 'template' ? <InputField /> : <Code />}
                </IconButton>
            </Tooltip>
        </InputAdornment>
    ) : undefined;

    if (mode === 'template') {
        return (
            <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ width: '100%' }}
            >
                <TextField
                    size="small"
                    label={intl.formatMessage({
                        id: 'destinationLayout.dialog.field.prefix.label',
                    })}
                    value={prefix}
                    onChange={(e) => onPrefixChange(e.target.value)}
                    sx={{ flex: 1 }}
                />
                <TextField
                    size="small"
                    disabled
                    label={intl.formatMessage({ id: keys.label })}
                    value={tokenValue}
                    sx={{
                        minWidth: 'fit-content',
                        maxWidth: 'fit-content',
                        flexShrink: 0,
                    }}
                />
                <TextField
                    size="small"
                    label={intl.formatMessage({
                        id: 'destinationLayout.dialog.field.suffix.label',
                    })}
                    value={suffix}
                    onChange={(e) => onSuffixChange(e.target.value)}
                    InputProps={{ endAdornment: adornment }}
                    sx={{ flex: 1 }}
                />
            </Stack>
        );
    }

    return (
        <TextField
            size="small"
            label={intl.formatMessage({ id: keys.label })}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="prod"
            required={required}
            error={Boolean(required && !value.trim())}
            fullWidth
            disabled={hideWhenFixed}
            InputProps={{ endAdornment: adornment }}
        />
    );
}
