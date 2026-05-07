import { Stack, TextField } from '@mui/material';

import { useIntl } from 'react-intl';

import {
    SCHEMA_TEMPLATE_STRING,
    TABLE_TEMPLATE_STRING,
} from 'src/components/materialization/targetNaming/shared';

export interface TemplateInputProps {
    field?: 'schema' | 'table';
    value: string;
    onChange: (value: string) => void;
    templateAllowed?: boolean;
    required?: boolean;
    tokenString?: string;
}

const FIELD_KEYS = {
    schema: {
        label: 'destinationLayout.dialog.schema.label',
        token: SCHEMA_TEMPLATE_STRING,
    },
    table: {
        label: 'destinationLayout.dialog.table.label',
        token: TABLE_TEMPLATE_STRING,
    },
} as const;

export function TemplateInput({
    field = 'schema',
    templateAllowed = true,
    required,
    value,
    onChange,
    tokenString,
}: TemplateInputProps) {
    const intl = useIntl();
    const keys = FIELD_KEYS[field];
    const tokenValue = tokenString ?? keys.token;
    const isTemplate = templateAllowed && value.includes(keys.token);

    if (isTemplate) {
        const [prefix = '', suffix = ''] = value.split(keys.token);
        return (
            <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ width: '100%' }}
            >
                <TextField
                    size="small"
                    label={`${intl.formatMessage({ id: keys.label })} ${intl.formatMessage(
                        {
                            id: 'destinationLayout.dialog.field.prefix.label',
                        }
                    )}`}
                    value={prefix}
                    onChange={(e) =>
                        onChange(`${e.target.value}${keys.token}${suffix}`)
                    }
                    sx={{ flex: 1 }}
                />
                <TextField
                    size="small"
                    disabled
                    label={intl.formatMessage({ id: keys.label })}
                    value={tokenValue}
                    inputProps={{ size: tokenValue.length }}
                    sx={{ flexShrink: 0 }}
                />
                <TextField
                    size="small"
                    label={`${intl.formatMessage({ id: keys.label })} ${intl.formatMessage(
                        {
                            id: 'destinationLayout.dialog.field.suffix.label',
                        }
                    )}`}
                    value={suffix}
                    onChange={(e) =>
                        onChange(`${prefix}${keys.token}${e.target.value}`)
                    }
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
        />
    );
}
