import type { ServiceAccountGrant } from 'src/api/combinedGrantsExt';
import type { Capability } from 'src/types';

import { useState } from 'react';

import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import { EditPencil, Folder, Lock, Plus, Trash } from 'iconoir-react';

import { useRemoveServiceAccountGrant } from 'src/api/gql/serviceAccounts';
import GrantDialog from 'src/components/admin/ServiceAccounts/GrantDialog';
import { capabilityColor } from 'src/components/admin/ServiceAccounts/shared';
import { usePrefixLeaves } from 'src/components/admin/ServiceAccounts/usePrefixLeaves';
import AlertBox from 'src/components/shared/AlertBox';

interface GrantsSectionProps {
    catalogName: string;
    grants: ServiceAccountGrant[];
    onChanged: () => void;
}

interface GrantDialogState {
    mode: 'add' | 'edit';
    prefix?: string;
    capability?: Capability;
}

function GrantsSection({ catalogName, grants, onChanged }: GrantsSectionProps) {
    const { leaves } = usePrefixLeaves();

    const [dialog, setDialog] = useState<GrantDialogState | null>(null);
    const [removeTarget, setRemoveTarget] =
        useState<ServiceAccountGrant | null>(null);
    const [removeError, setRemoveError] = useState<string | null>(null);

    const [{ fetching: removing }, removeServiceAccountGrant] =
        useRemoveServiceAccountGrant();

    const handleRemove = async () => {
        if (!removeTarget) {
            return;
        }

        setRemoveError(null);

        const result = await removeServiceAccountGrant({
            catalogName,
            prefix: removeTarget.object_role,
        });

        if (result.error) {
            setRemoveError(result.error.message);
            return;
        }

        setRemoveTarget(null);
        onChanged();
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
                    sx={{ alignItems: 'center', py: 2, color: 'text.secondary' }}
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
                        key={grant.id}
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
                            {grant.object_role}
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
                                    prefix: grant.object_role,
                                    capability: grant.capability,
                                })
                            }
                        >
                            <EditPencil width={16} height={16} />
                        </IconButton>
                        <IconButton
                            size="small"
                            aria-label="Remove grant"
                            onClick={() => {
                                setRemoveError(null);
                                setRemoveTarget(grant);
                            }}
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
                onSaved={onChanged}
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
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: (theme) => theme.palette.error.alpha_12,
                                color: 'error.main',
                            }}
                        >
                            <Trash />
                        </Box>
                        <Stack spacing={1}>
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
                                    {removeTarget?.object_role}
                                </Box>
                                . Existing API keys will stop working for this
                                prefix.
                            </Typography>
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
                        disabled={removing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRemove}
                        disabled={removing}
                        loading={removing}
                    >
                        Remove grant
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GrantsSection;
