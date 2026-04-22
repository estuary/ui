import { Box, Link, Stack, TextField } from '@mui/material';

import { useIntl } from 'react-intl';

export interface SchemaInputProps {
    mode: 'fixed' | 'template';
    onModeChange: (mode: 'fixed' | 'template') => void;
    value: string;
    onChange: (value: string) => void;
    prefix: string;
    onPrefixChange: (v: string) => void;
    suffix: string;
    onSuffixChange: (v: string) => void;
}

export function SchemaInput({
    mode,
    onModeChange,
    value,
    onChange,
    prefix,
    onPrefixChange,
    suffix,
    onSuffixChange,
}: SchemaInputProps) {
    const intl = useIntl();

    return (
        <Stack spacing={0.5}>
            {mode === 'fixed' ? (
                <TextField
                    size="small"
                    label={intl.formatMessage({
                        id: 'destinationLayout.dialog.schema.label',
                    })}
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
                            id: 'destinationLayout.dialog.schema.prefix.label',
                        })}
                        value={prefix}
                        onChange={(e) => onPrefixChange(e.target.value)}
                        autoFocus
                    />
                    <TextField
                        size="small"
                        disabled
                        label=" "
                        value="schema"
                        onChange={(e) => onPrefixChange(e.target.value)}
                        sx={{ maxWidth: 80 }}
                        autoFocus
                    />
                    <TextField
                        size="small"
                        label={intl.formatMessage({
                            id: 'destinationLayout.dialog.schema.suffix.label',
                        })}
                        value={suffix}
                        onChange={(e) => onSuffixChange(e.target.value)}
                    />
                </Stack>
            )}
            <Box>
                <Link
                    component="button"
                    variant="caption"
                    onClick={() =>
                        onModeChange(mode === 'fixed' ? 'template' : 'fixed')
                    }
                >
                    {mode === 'fixed'
                        ? intl.formatMessage({
                              id: 'destinationLayout.dialog.schema.useTemplate',
                          })
                        : intl.formatMessage({
                              id: 'destinationLayout.dialog.schema.useFixed',
                          })}
                </Link>
            </Box>
        </Stack>
    );
}
