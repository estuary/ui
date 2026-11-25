import type { ControlProps, RankedTester } from '@jsonforms/core';
import type { Schema } from 'src/types';

import { useState } from 'react';

import {
    alpha,
    Box,
    Button,
    FormHelperText,
    Link,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { and, rankWith, schemaMatches, uiTypeIs } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { format } from 'date-fns';

import { SecretValueInput } from 'src/components/secrets/SecretValueInput';
import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { getButtonIcon } from 'src/context/Theme';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { FileUploadDialog } from 'src/generatedModules/FileUpload/FileUploadDialog';
import { useGetSecret } from 'src/hooks/secrets/useGetSecret';
import { useCopyToClipboard } from 'src/hooks/useCopyToClipboard';
import useEntityNameSuffix from 'src/hooks/useEntityNameSuffix';
import {
    useEndpointConfigStore_activeSecretNames,
    useEndpointConfigStore_clearStoredSecrets,
    useEndpointConfigStore_savedSecretNames,
} from 'src/stores/EndpointConfig/hooks';
import { Annotations } from 'src/types/jsonforms';
import { getIdTimestamp } from 'src/utils/flow-id-utils';
import { toJsonPointer } from 'src/utils/schema-utils';
import { isSecretSchema, replacesStoredSecret } from 'src/utils/secrets-utils';

// Muted text, as in the design system's `--text-muted`
const MUTED_TEXT_OPACITY = 0.55;

const isStringSchema = ({ type }: Schema) =>
    type === 'string' || (Array.isArray(type) && type.includes('string'));

// Above the nullable control (1000), which a nullable secret also matches
export const secretFieldTester: RankedTester = rankWith(
    1100,
    and(
        uiTypeIs('Control'),
        schemaMatches(
            (schema) =>
                isSecretSchema(schema as Schema) &&
                isStringSchema(schema as Schema)
        )
    )
);

// A stored secret is named in the store, not the field's data. A value typed
// in is kept in the config until Next sets it as a secret.
const SecretFieldRenderer = ({
    data,
    description,
    enabled,
    errors,
    handleChange,
    label,
    path,
    required,
    schema,
    visible,
}: ControlProps) => {
    const theme = useTheme();

    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();
    // The task's name in edit, where the warning below shows
    const catalogName = useEntityNameSuffix(false);
    const activeSecretNames = useEndpointConfigStore_activeSecretNames();
    const savedSecretNames = useEndpointConfigStore_savedSecretNames();
    const clearStoredSecrets = useEndpointConfigStore_clearStoredSecrets();

    const [uploadOpen, setUploadOpen] = useState(false);
    const { isCopied, handleCopy } = useCopyToClipboard('SecretField');

    const pointer = toJsonPointer(path);
    const existingName = activeSecretNames[pointer];
    const value = typeof data === 'string' ? data : '';
    const multiline = (schema as any)[Annotations.multiline] === true;
    // Whether Next overwrites a stored secret with the typed value
    const replacesStored = replacesStoredSecret(
        catalogName,
        pointer,
        activeSecretNames,
        savedSecretNames
    );
    // A stored secret is the field's value, so it has nothing to report. JSON
    // Forms can still have an error from before its schema caught up.
    const fieldErrors = existingName ? '' : errors;

    const setValue = (next: string) => handleChange(path, next || undefined);

    const clearValue = () => {
        handleChange(path, undefined);
        clearStoredSecrets(pointer);
    };

    const { secret } = useGetSecret(existingName ?? '');

    if (!visible) {
        return null;
    }

    const mutedColor = alpha(theme.palette.text.primary, MUTED_TEXT_OPACITY);
    const updatedAt = secret?.secretId
        ? getIdTimestamp(secret.secretId)
        : undefined;

    return (
        <Box sx={{ my: 1 }}>
            <Stack spacing={0} sx={{ minWidth: 0 }}>
                <SecretValueInput
                    value={value}
                    onChange={setValue}
                    label={label}
                    helperText={
                        <Box
                            component="span"
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                columnGap: 4,
                            }}
                        >
                            <span>
                                {description ? `${description} ` : null}
                                {`The value is encrypted and never appears in the ${entityType} spec.`}
                                {existingName ? (
                                    <>
                                        {' '}
                                        <Tooltip
                                            title={existingName}
                                            placement="top"
                                        >
                                            <Link
                                                component="button"
                                                type="button"
                                                underline="hover"
                                                onClick={() =>
                                                    handleCopy(existingName)
                                                }
                                                sx={{
                                                    'font': 'inherit',
                                                    'verticalAlign': 'middle',
                                                    'display': 'inline-flex',
                                                    'alignItems': 'center',
                                                    'gap': 0.5,
                                                    '& svg': {
                                                        width: '1.1em',
                                                        height: '1.1em',
                                                    },
                                                }}
                                            >
                                                {getButtonIcon(
                                                    theme,
                                                    isCopied
                                                        ? 'success'
                                                        : undefined
                                                )}
                                                {isCopied
                                                    ? 'Copied secret name'
                                                    : 'Copy secret name'}
                                            </Link>
                                        </Tooltip>
                                    </>
                                ) : null}
                            </span>

                            {existingName && updatedAt ? (
                                <Tooltip
                                    title={format(
                                        updatedAt,
                                        'MMM d, yyyy h:mm a'
                                    )}
                                >
                                    <Typography
                                        component="span"
                                        variant="caption"
                                        sx={{
                                            color: mutedColor,
                                            flexShrink: 0,
                                            display: {
                                                xs: 'none',
                                                sm: 'inline',
                                            },
                                        }}
                                    >
                                        {formatUpdated(updatedAt)}
                                    </Typography>
                                </Tooltip>
                            ) : null}
                        </Box>
                    }
                    multiline={multiline}
                    required={required}
                    error={Boolean(fieldErrors)}
                    disabled={!enabled}
                    placeholder={
                        existingName
                            ? 'Secret is set. Enter a new value to replace it.'
                            : undefined
                    }
                    onClear={existingName ? clearValue : undefined}
                />

                {multiline ? (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            size="small"
                            disabled={!enabled}
                            onClick={() => setUploadOpen(true)}
                        >
                            Use secret from file
                        </Button>
                    </Box>
                ) : null}

                {fieldErrors ? (
                    <FormHelperText error sx={{ m: 0 }}>
                        {fieldErrors}
                    </FormHelperText>
                ) : null}
            </Stack>

            {isEdit && value && replacesStored ? (
                <Box sx={{ pt: 1 }}>
                    <AlertBox short severity="warning">
                        {`Clicking Next changes this secret immediately, even without publishing. Running tasks that use it will get the new value the next time they restart.`}
                    </AlertBox>
                </Box>
            ) : null}

            <FileUploadDialog
                open={uploadOpen}
                title="Use secret from file"
                onClose={() => setUploadOpen(false)}
                onFileRead={(content) => setValue(content ?? '')}
            />
        </Box>
    );
};

function formatUpdated(date: Date) {
    return Date.now() - date.getTime() < 60_000
        ? 'Updated just now'
        : `Updated ${format(date, 'MMM d, yyyy')}`;
}

export const SecretField = withJsonFormsControlProps(SecretFieldRenderer);
