import type { ApiKeyInfo, ServiceAccount } from 'src/gql-types/graphql';

import { useState } from 'react';

import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import { DateTime } from 'luxon';

import { useRevokeApiKey } from 'src/api/gql/serviceAccounts';
import CreateApiKeyDialog from 'src/components/admin/ServiceAccounts/CreateApiKeyDialog';
import Error from 'src/components/shared/Error';

interface Props {
    serviceAccount: Pick<ServiceAccount, 'id' | 'displayName' | 'apiKeys'>;
    isDisabled: boolean;
}

function isExpired(expiresAt: string): boolean {
    return DateTime.fromISO(expiresAt) < DateTime.now();
}

function ApiKeyRow({ apiKey }: { apiKey: ApiKeyInfo }) {
    const [, revokeApiKey] = useRevokeApiKey();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const expired = isExpired(apiKey.expiresAt);

    const handleRevoke = async () => {
        setError(null);
        setRevoking(true);

        const result = await revokeApiKey({ id: apiKey.id });

        setRevoking(false);

        if (result.error) {
            setError(result.error.message);
            return;
        }

        setConfirmOpen(false);
    };

    return (
        <TableRow>
            <TableCell>
                <Typography variant="body2">{apiKey.label}</Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {DateTime.fromISO(apiKey.createdAt).toLocaleString(
                        DateTime.DATE_MED
                    )}
                </Typography>
            </TableCell>

            <TableCell>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <Typography variant="body2">
                        {DateTime.fromISO(apiKey.expiresAt).toLocaleString(
                            DateTime.DATE_MED
                        )}
                    </Typography>
                    {expired ? (
                        <Chip
                            label="Expired"
                            size="small"
                            color="error"
                            variant="outlined"
                        />
                    ) : null}
                </Stack>
            </TableCell>

            <TableCell>
                <Typography variant="body2" color="text.secondary">
                    {apiKey.lastUsedAt
                        ? DateTime.fromISO(apiKey.lastUsedAt).toRelative()
                        : 'Never'}
                </Typography>
            </TableCell>

            <TableCell>
                <Button
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() => setConfirmOpen(true)}
                    disabled={revoking}
                >
                    Revoke
                </Button>

                <Dialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>Revoke API Key</DialogTitle>
                    <DialogContent>
                        <Stack spacing={1}>
                            {error ? (
                                <Error
                                    condensed
                                    error={{ message: error }}
                                    severity="error"
                                />
                            ) : null}
                            <Typography>
                                {`Revoke "${apiKey.label}"? This action is permanent.`}
                            </Typography>
                            {apiKey.lastUsedAt &&
                            DateTime.fromISO(apiKey.lastUsedAt) >
                                DateTime.now().minus({ hours: 1 }) ? (
                                <Typography
                                    variant="body2"
                                    color="warning.main"
                                >
                                    {`Processes that authenticated with this key may still have access for up to ${Math.ceil(DateTime.fromISO(apiKey.lastUsedAt).plus({ hours: 1 }).diff(DateTime.now(), 'minutes').minutes)} minutes.`}
                                </Typography>
                            ) : null}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setConfirmOpen(false)}
                            disabled={revoking}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleRevoke}
                            disabled={revoking}
                            loading={revoking}
                        >
                            Revoke
                        </Button>
                    </DialogActions>
                </Dialog>
            </TableCell>
        </TableRow>
    );
}

function ApiKeysRow({ serviceAccount, isDisabled }: Props) {
    return (
        <TableRow>
            <TableCell colSpan={7} sx={{ p: 0 }}>
                <Box sx={{ px: 4, py: 2, bgcolor: 'background.default' }}>
                    <Stack
                        direction="row"
                        sx={{
                            mb: 1,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="subtitle2">API Keys</Typography>

                        {!isDisabled ? (
                            <CreateApiKeyDialog
                                serviceAccountId={serviceAccount.id}
                                serviceAccountName={serviceAccount.displayName}
                            />
                        ) : null}
                    </Stack>

                    {serviceAccount.apiKeys.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No API keys. Create one to enable programmatic
                            authentication.
                        </Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Label</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Expires</TableCell>
                                    <TableCell>Last Used</TableCell>
                                    <TableCell sx={{ width: 125 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {serviceAccount.apiKeys.map((key) => (
                                    <ApiKeyRow key={key.id} apiKey={key} />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}

export default ApiKeysRow;
