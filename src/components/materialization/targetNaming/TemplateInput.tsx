import { Box, Link, Stack, TextField } from '@mui/material';

import { useIntl } from 'react-intl';

export interface TemplateInputProps {
    field?: 'schema' | 'table';
    mode: 'fixed' | 'template';
    onModeChange: (mode: 'fixed' | 'template') => void;
    value: string;
    onChange: (value: string) => void;
    prefix: string;
    onPrefixChange: (v: string) => void;
    suffix: string;
    onSuffixChange: (v: string) => void;
    disableTemplate?: boolean;
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
    value,
    onChange,
    prefix,
    onPrefixChange,
    suffix,
    onSuffixChange,
    disableTemplate,
}: TemplateInputProps) {
    const intl = useIntl();
    const keys = FIELD_KEYS[field];

    return (
        <Stack spacing={0.5}>
            {mode === 'fixed' || disableTemplate ? (
                <TextField
                    size="small"
                    label={intl.formatMessage({ id: keys.label })}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="prod"
                    sx={{ maxWidth: 200 }}
                    autoFocus
                />
            ) : (
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
            )}
            {disableTemplate ? null : (
                <Box>
                    <Link
                        component="button"
                        variant="caption"
                        onClick={() =>
                            onModeChange(
                                mode === 'fixed' ? 'template' : 'fixed'
                            )
                        }
                    >
                        {intl.formatMessage({
                            id:
                                mode === 'fixed'
                                    ? keys.useTemplate
                                    : keys.useFixed,
                        })}
                    </Link>
                </Box>
            )}
        </Stack>
    );
}
