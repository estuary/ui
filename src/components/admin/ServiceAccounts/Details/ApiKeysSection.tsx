import type { ServiceAccountApiKey } from 'src/gql-types/graphql';

import { useMemo, useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import { Key, Plus, Trash } from 'iconoir-react';
import { DateTime } from 'luxon';

import { useRevokeApiKey } from 'src/api/gql/serviceAccounts';
import {
    ExpiryWarning,
    tokenExpiry,
} from 'src/components/admin/ServiceAccounts/ExpiryWarning';
import { UsageIndicator } from 'src/components/admin/ServiceAccounts/UsageIndicator';
import AlertBox from 'src/components/shared/AlertBox';

interface ApiKeysSectionProps {
    tokens: ServiceAccountApiKey[];
    onCreateKey: () => void;
}

function isExpired(expiresAt: string): boolean {
    return DateTime.fromISO(expiresAt) < DateTime.now();
}

// Minutes a recently-used key may still be honored after revocation.
function recentlyUsedGraceMinutes(
    lastUsedAt: string | null | undefined
): number | null {
    if (!lastUsedAt) {
        return null;
    }

    const usedRecently =
        DateTime.fromISO(lastUsedAt) > DateTime.now().minus({ hours: 1 });

    if (!usedRecently) {
        return null;
    }

    return Math.ceil(
        DateTime.fromISO(lastUsedAt)
            .plus({ hours: 1 })
            .diff(DateTime.now(), 'minutes').minutes
    );
}

export function ApiKeysSection({ tokens, onCreateKey }: ApiKeysSectionProps) {
    const [revokeTarget, setRevokeTarget] =
        useState<ServiceAccountApiKey | null>(null);
    const [revokeError, setRevokeError] = useState<string | null>(null);

    const [{ fetching: revoking }, revokeApiKey] = useRevokeApiKey();

    const revokeToken = async (token: ServiceAccountApiKey) => {
        setRevokeError(null);

        const result = await revokeApiKey({ id: token.id });

        if (result.error) {
            // Surface the failure in the confirmation dialog — the expired-key
            // path skips confirmation, so the error would otherwise be silent.
            setRevokeError(result.error.message);
            setRevokeTarget(token);
            return;
        }

        setRevokeTarget(null);
    };

    // Expired keys are already inert, so revoking one skips the confirmation
    // dialog; active keys open it first.
    const requestRevoke = (token: ServiceAccountApiKey) => {
        if (isExpired(token.expiresAt)) {
            void revokeToken(token);
        } else {
            setRevokeError(null);
            setRevokeTarget(token);
        }
    };

    const handleConfirmRevoke = () => {
        if (revokeTarget) {
            void revokeToken(revokeTarget);
        }
    };

    const graceMinutes = recentlyUsedGraceMinutes(revokeTarget?.lastUsedAt);
    const revokeLabel = revokeTarget?.detail ?? 'Unnamed key';

    // Surface the keys expiring soonest at the top.
    const sortedTokens = useMemo(
        () =>
            [...tokens].sort(
                (a, b) =>
                    DateTime.fromISO(a.expiresAt).toMillis() -
                    DateTime.fromISO(b.expiresAt).toMillis()
            ),
        [tokens]
    );

    return (
        <Box>
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    mb: 1,
                }}
            >
                <Box>
                    <Typography variant="subtitle1">API keys</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Secrets are shown once at creation. Rotate or revoke
                        them anytime.
                    </Typography>
                </Box>
                <Button
                    variant="text"
                    startIcon={<Plus />}
                    onClick={onCreateKey}
                    sx={{ flex: 'none' }}
                >
                    Create API key
                </Button>
            </Stack>

            {tokens.length === 0 ? (
                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                        alignItems: 'center',
                        py: 2,
                        color: 'text.secondary',
                    }}
                >
                    <Key />
                    <Typography variant="body2">
                        No API keys yet. Create one to let this account
                        authenticate.
                    </Typography>
                </Stack>
            ) : (
                sortedTokens.map((token) => {
                    const expiryAlert = tokenExpiry(token.expiresAt);
                    const createdDate = DateTime.fromISO(
                        token.createdAt
                    ).toLocaleString(DateTime.DATE_MED);
                    const createdLabel = token.createdByEmail
                        ? `Created on ${createdDate} by ${token.createdByEmail}`
                        : `Created on ${createdDate}`;

                    return (
                        <Stack
                            key={token.id}
                            direction="row"
                            spacing={2.5}
                            sx={{
                                alignItems: 'center',
                                py: 1.75,
                                borderBottom: (theme) =>
                                    `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    color: 'text.secondary',
                                }}
                            >
                                <Key />
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {token.detail ?? 'Unnamed key'}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {createdLabel}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 'none', textAlign: 'right' }}>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    {expiryAlert ? (
                                        <ExpiryWarning
                                            expiresAt={token.expiresAt}
                                        />
                                    ) : (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {`Expires ${DateTime.fromISO(token.expiresAt).toLocaleString(DateTime.DATE_MED)}`}
                                        </Typography>
                                    )}
                                </Stack>
                                <UsageIndicator
                                    lastUsedAt={token.lastUsedAt}
                                    sx={{ justifyContent: 'flex-end' }}
                                />
                            </Box>

                            <IconButton
                                size="small"
                                aria-label="Revoke key"
                                onClick={() => requestRevoke(token)}
                            >
                                <Trash width={17} height={17} />
                            </IconButton>
                        </Stack>
                    );
                })
            )}

            <Dialog
                open={Boolean(revokeTarget)}
                onClose={() => setRevokeTarget(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogContent>
                    <Stack spacing={1.5}>
                        <Typography variant="subtitle1">
                            Revoke API key?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            “
                            <Box
                                component="span"
                                sx={{ color: 'text.primary' }}
                            >
                                {revokeLabel}
                            </Box>
                            ” will stop working immediately and can’t be
                            restored. Any integration using it will lose access.
                        </Typography>
                        {graceMinutes ? (
                            <Typography variant="body2" color="warning.main">
                                {`Processes that authenticated with this key may still have access for up to ${graceMinutes} minutes.`}
                            </Typography>
                        ) : null}
                        {revokeError ? (
                            <AlertBox severity="error" short>
                                <Typography>{revokeError}</Typography>
                            </AlertBox>
                        ) : null}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={() => setRevokeTarget(null)}
                        disabled={revoking}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmRevoke}
                        disabled={revoking}
                        loading={revoking}
                    >
                        Revoke key
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
