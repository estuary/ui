import type { UserGrant } from 'src/gql-types/graphql';
import type { Capability } from 'src/types';

import { useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import { EditPencil, Folder, Lock, Plus, Trash } from 'iconoir-react';

import {
    useRemoveServiceAccountGrant,
    useRevokeAllApiKeys,
} from 'src/api/gql/serviceAccounts';
import { GrantDialog } from 'src/components/admin/ServiceAccounts/GrantDialog';
import { capabilityColor } from 'src/components/admin/ServiceAccounts/shared';
import { usePrefixLeaves } from 'src/components/admin/ServiceAccounts/usePrefixLeaves';
import AlertBox from 'src/components/shared/AlertBox';

interface GrantsSectionProps {
    catalogName: string;
    grants: UserGrant[];
    // Number of API keys the account owns, used to offer revoking them when the
    // last grant is removed.
    tokenCount: number;
}

interface GrantDialogState {
    mode: 'add' | 'edit';
    prefix?: string;
    capability?: Capability;
}

export function GrantsSection({
    catalogName,
    grants,
    tokenCount,
}: GrantsSectionProps) {
    const { leaves } = usePrefixLeaves();

    const [dialog, setDialog] = useState<GrantDialogState | null>(null);
    const [removeTarget, setRemoveTarget] = useState<UserGrant | null>(null);
    const [revokeKeysToo, setRevokeKeysToo] = useState(false);
    const [removeError, setRemoveError] = useState<string | null>(null);

    const [{ fetching: removing }, removeServiceAccountGrant] =
        useRemoveServiceAccountGrant();
    const [{ fetching: revoking }, revokeAllApiKeys] = useRevokeAllApiKeys();

    // Removing the only remaining grant leaves the account with no access.
    const removingLastGrant = grants.length === 1;
    const offerRevokeKeys = removingLastGrant && tokenCount > 0;
    const busy = removing || revoking;

    const openRemove = (grant: UserGrant) => {
        setRemoveError(null);
        setRevokeKeysToo(false);
        setRemoveTarget(grant);
    };

    const handleRemove = async () => {
        if (!removeTarget) {
            return;
        }

        setRemoveError(null);

        const result = await removeServiceAccountGrant({
            catalogName,
            prefix: removeTarget.prefix,
        });

        if (result.error) {
            setRemoveError(result.error.message);
            return;
        }

        if (offerRevokeKeys && revokeKeysToo) {
            const revokeResult = await revokeAllApiKeys({
                catalogName,
            });

            if (revokeResult.error) {
                // The grant is already gone; surface the partial failure.
                setRemoveError(
                    `The grant was removed, but the API keys could not be revoked: ${revokeResult.error.message}`
                );
                return;
            }
        }

        setRemoveTarget(null);
    };

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
                    <Typography variant="subtitle1">Access grants</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Catalog prefixes this account can act on, and at what
                        capability.
                    </Typography>
                </Box>
                <Button
                    variant="text"
                    startIcon={<Plus />}
                    onClick={() => setDialog({ mode: 'add' })}
                    sx={{ flex: 'none' }}
                >
                    Add grant
                </Button>
            </Stack>

            {grants.length === 0 ? (
                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                        alignItems: 'center',
                        py: 2,
                        color: 'text.secondary',
                    }}
                >
                    <Lock />
                    <Typography variant="body2">
                        No access grants yet — this account can’t read or write
                        any data until you add one.
                    </Typography>
                </Stack>
            ) : (
                grants.map((grant) => (
                    <Stack
                        key={grant.prefix}
                        direction="row"
                        spacing={1.75}
                        sx={{
                            alignItems: 'center',
                            py: 1.5,
                            borderBottom: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Box sx={{ display: 'flex', color: 'text.secondary' }}>
                            <Folder />
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {grant.prefix}
                        </Typography>
                        <Chip
                            label={grant.capability}
                            size="small"
                            color={capabilityColor(grant.capability)}
                        />
                        <IconButton
                            size="small"
                            aria-label="Edit capability"
                            onClick={() =>
                                setDialog({
                                    mode: 'edit',
                                    prefix: grant.prefix,
                                    capability: grant.capability as Capability,
                                })
                            }
                        >
                            <EditPencil width={16} height={16} />
                        </IconButton>
                        <IconButton
                            size="small"
                            aria-label="Remove grant"
                            onClick={() => openRemove(grant)}
                        >
                            <Trash width={17} height={17} />
                        </IconButton>
                    </Stack>
                ))
            )}

            <GrantDialog
                open={Boolean(dialog)}
                mode={dialog?.mode ?? 'add'}
                catalogName={catalogName}
                leaves={leaves}
                initialPrefix={dialog?.prefix}
                initialCapability={dialog?.capability}
                onClose={() => setDialog(null)}
            />

            <Dialog
                open={Boolean(removeTarget)}
                onClose={() => setRemoveTarget(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogContent>
                    <Stack direction="row" spacing={1.5}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                flex: 'none',
                                borderRadius: (theme) => theme.radius.md,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: (theme) =>
                                    theme.palette.error.alpha_12,
                                color: 'error.main',
                            }}
                        >
                            <Trash />
                        </Box>
                        <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                            <Box>
                                <Typography variant="subtitle1">
                                    Remove access grant?
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    This account will immediately lose access to{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            fontFamily: 'monospace',
                                            color: 'text.primary',
                                        }}
                                    >
                                        {removeTarget?.prefix}
                                    </Box>
                                    . Existing API keys will stop working for
                                    this prefix.
                                </Typography>
                            </Box>

                            {offerRevokeKeys ? (
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: (theme) =>
                                            theme.radius.md,
                                        border: (theme) =>
                                            `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <FormControlLabel
                                        sx={{ alignItems: 'flex-start', m: 0 }}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={revokeKeysToo}
                                                onChange={(event) =>
                                                    setRevokeKeysToo(
                                                        event.target.checked
                                                    )
                                                }
                                                sx={{ pt: 0 }}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                This is the account’s last
                                                grant. Also revoke its{' '}
                                                {tokenCount === 1
                                                    ? '1 API key'
                                                    : `${tokenCount} API keys`}{' '}
                                                so the leftover credential can’t
                                                be used.
                                            </Typography>
                                        }
                                    />
                                </Box>
                            ) : null}

                            {removeError ? (
                                <AlertBox severity="error" short>
                                    <Typography>{removeError}</Typography>
                                </AlertBox>
                            ) : null}
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={() => setRemoveTarget(null)}
                        disabled={busy}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRemove}
                        disabled={busy}
                        loading={busy}
                    >
                        {revokeKeysToo && offerRevokeKeys
                            ? 'Remove grant & revoke keys'
                            : 'Remove grant'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
