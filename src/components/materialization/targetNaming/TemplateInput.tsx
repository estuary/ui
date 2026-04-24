import { Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';

import { useIntl } from 'react-intl';

export interface TemplateInputProps {
    field?: 'schema' | 'table';
    mode: 'fixed' | 'template';
    onModeChange?: (mode: 'fixed' | 'template') => void;
    hideWhenFixed?: boolean;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    prefix: string;
    onPrefixChange: (v: string) => void;
    suffix: string;
    onSuffixChange: (v: string) => void;
}

const FIELD_KEYS = {
    schema: {
        label: 'destinationLayout.dialog.schema.label',
        token: 'schema',
        useTemplate: 'destinationLayout.dialog.schema.useTemplate',
    },
    table: {
        label: 'destinationLayout.dialog.table.label',
        token: 'table',
        useTemplate: 'destinationLayout.dialog.table.useTemplate',
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
}: TemplateInputProps) {
    const intl = useIntl();
    const keys = FIELD_KEYS[field];

    const handleToggle = (checked: boolean) => {
        onModeChange?.(checked ? 'template' : 'fixed');
    };

    return (
        <Stack spacing={0.5}>
            {!onModeChange ? null : (
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={mode === 'template'}
                            onChange={(e) => handleToggle(e.target.checked)}
                        />
                    }
                    label={intl.formatMessage({ id: keys.useTemplate })}
                />
            )}
            {mode === 'template' ? (
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <TextField
                        size="small"
                        label={intl.formatMessage({
                            id: 'destinationLayout.dialog.field.prefix.label',
                        })}
                        value={prefix}
                        onChange={(e) => onPrefixChange(e.target.value)}
                        autoFocus
                    />
                    <TextField
                        size="small"
                        disabled
                        label=" "
                        value={keys.token}
                        sx={{ maxWidth: 80 }}
                    />
                    <TextField
                        size="small"
                        label={intl.formatMessage({
                            id: 'destinationLayout.dialog.field.suffix.label',
                        })}
                        value={suffix}
                        onChange={(e) => onSuffixChange(e.target.value)}
                    />
                </Stack>
            ) : hideWhenFixed ? null : (
                <TextField
                    size="small"
                    label={intl.formatMessage({ id: keys.label })}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="prod"
                    sx={{ maxWidth: 200 }}
                    autoFocus
                    required={required}
                    error={Boolean(required && !value.trim())}
                />
            )}
        </Stack>
    );
}
