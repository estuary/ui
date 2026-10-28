import type { ControlProps, RankedTester } from '@jsonforms/core';

import { useState } from 'react';

import {
    alpha,
    Box,
    Button,
    FormHelperText,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { and, rankWith, schemaMatches, uiTypeIs } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { format } from 'date-fns';
import { Lock } from 'iconoir-react';
import { useSnackbar } from 'notistack';

import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { SecretFieldDialog } from 'src/forms/renderers/secrets/SecretFieldDialog';
import { useGetSecret } from 'src/hooks/secrets/useGetSecret';
import { useSetSecret } from 'src/hooks/secrets/useSetSecret';
import useEntityNameSuffix from 'src/hooks/useEntityNameSuffix';
import {
    useSecretsStore_hasSecretValue,
    useSecretsStore_secretMissing,
    useSecretsStore_secretName,
    useSecretsStore_secretRequired,
    useSecretsStore_serverUpdateRequired,
    useSecretsStore_setSecretName,
    useSecretsStore_setSecretValue,
} from 'src/stores/Secrets/hooks';
import { Annotations } from 'src/types/jsonforms';
import { getIdTimestamp } from 'src/utils/flow-id-utils';
import { snackbarSettings } from 'src/utils/notification-utils';
import {
    getSecretName,
    isSecretSchema,
    toJsonPointer,
} from 'src/utils/secrets-utils';

// Muted text, as in the design system's `--text-muted`
const MUTED_TEXT_OPACITY = 0.55;

// Above the nullable control (1000), which a nullable secret also matches
export const secretFieldTester: RankedTester = rankWith(
    1100,
    and(uiTypeIs('Control'), schemaMatches(isSecretSchema))
);

// The field's secret name lives in the Secrets store, not the endpoint config;
// the spec keeps it in the `secrets` stanza
const SecretFieldRenderer = ({
    description,
    enabled,
    label,
    path,
    schema,
    visible,
}: ControlProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();
    const taskName = useEntityNameSuffix(!isEdit);
    const setSecret = useSetSecret();
    const setSecretValue = useSecretsStore_setSecretValue();
    const setSecretName = useSecretsStore_setSecretName();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [saved, setSaved] = useState<{ name: string; secretId: string }>();

    const pointer = toJsonPointer(path);
    const existingName = useSecretsStore_secretName(pointer) || undefined;
    const required = useSecretsStore_secretRequired(pointer);
    const missing = useSecretsStore_secretMissing(pointer);

    // In create, entered values are held until the draft exists, then saved
    // under names for it
    const held = useSecretsStore_hasSecretValue(pointer);
    const secretsServerUpdateRequired = useSecretsStore_serverUpdateRequired();
    const unsaved = held && secretsServerUpdateRequired;

    // Paused while unsaved, so it runs again once Next saves. After a save in
    // edit the query isn't rerun, so the saved id takes over.
    const { secret } = useGetSecret(unsaved ? '' : (existingName ?? ''));
    const secretId =
        saved && saved.name === existingName
            ? saved.secretId
            : secret?.secretId;

    if (!visible) {
        return null;
    }

    const mutedColor = alpha(theme.palette.text.primary, MUTED_TEXT_OPACITY);

    const updatedAt = secretId ? getIdTimestamp(secretId) : undefined;

    const handleSave = async (value: string) => {
        if (!isEdit) {
            setSecretValue(pointer, value);
            setDialogOpen(false);
            return;
        }

        const secretName = existingName ?? getSecretName(taskName, path);

        const result = await setSecret(secretName, value);
        if (result?.secret) {
            setSaved({ name: secretName, secretId: result.secret.secretId });
        }

        setDialogOpen(false);

        // An unchanged reference leaves the spec as is
        if (existingName) {
            enqueueSnackbar(
                `${label} has been updated. Currently running tasks will get the updated value the next time they restart.`,
                { ...snackbarSettings, variant: 'success' }
            );
        }

        setSecretName(pointer, secretName);
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                }}
            >
                <Stack spacing={0} sx={{ minWidth: 0 }}>
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: 'center' }}
                    >
                        <Typography
                            variant="caption"
                            color={missing ? 'error' : 'text.secondary'}
                        >
                            {label}
                            {required ? ' *' : ''}
                        </Typography>
                        <Tooltip
                            title={`Stored as an encrypted secret. The value never appears in the ${entityType} spec.`}
                        >
                            <Lock
                                aria-label="About secret fields"
                                color={theme.palette.primary.main}
                                style={{ fontSize: 12 }}
                            />
                        </Tooltip>
                    </Stack>

                    {description ? (
                        <FormHelperText sx={{ m: 0 }}>
                            {description}
                        </FormHelperText>
                    ) : null}

                    {existingName ? null : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic', pt: 0.5 }}
                        >
                            {held ? 'Saved when you click Next' : 'Not set'}
                        </Typography>
                    )}

                    {missing ? (
                        <FormHelperText error sx={{ m: 0 }}>
                            is a required property
                        </FormHelperText>
                    ) : null}
                </Stack>

                <Button
                    size="small"
                    variant="outlined"
                    disabled={!enabled}
                    onClick={() => setDialogOpen(true)}
                    sx={{ flexShrink: 0 }}
                >
                    {existingName || held ? 'Edit secret' : 'Set secret'}
                </Button>
            </Stack>

            {existingName ? (
                <Stack
                    direction="row"
                    sx={{
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        columnGap: 1.5,
                        rowGap: 0.5,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: 'center', minWidth: 0 }}
                    >
                        <Typography
                            variant="caption"
                            color="primary.main"
                            sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
                        >
                            Secret{' '}
                            <TechnicalEmphasis
                                sx={{
                                    color: mutedColor,
                                }}
                            >
                                {existingName}
                            </TechnicalEmphasis>
                        </Typography>

                        <Tooltip title="Copy secret name">
                            <span>
                                <CopyToClipboardButton
                                    label="Copy secret name"
                                    writeValue={existingName}
                                />
                            </span>
                        </Tooltip>
                    </Stack>

                    {updatedAt ? (
                        <Tooltip
                            title={format(updatedAt, 'MMM d, yyyy h:mm a')}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: mutedColor,
                                }}
                            >
                                {formatUpdated(updatedAt)}
                            </Typography>
                        </Tooltip>
                    ) : null}
                </Stack>
            ) : null}

            {dialogOpen ? (
                <SecretFieldDialog
                    fieldLabel={label}
                    description={description}
                    multiline={(schema as any)[Annotations.multiline] === true}
                    live={Boolean(isEdit && existingName)}
                    onClose={() => setDialogOpen(false)}
                    onSave={handleSave}
                />
            ) : null}
        </Box>
    );
};

function formatUpdated(date: Date) {
    return Date.now() - date.getTime() < 60_000
        ? 'Updated just now'
        : `Updated ${format(date, 'MMM d, yyyy')}`;
}

export const SecretField = withJsonFormsControlProps(SecretFieldRenderer);
