import type { Capability } from 'src/types';

import { useEffect, useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
    Typography,
} from '@mui/material';

import { Lock } from 'iconoir-react';

import { useAddServiceAccountGrant } from 'src/api/gql/serviceAccounts';
import CapabilitySelector from 'src/components/admin/ServiceAccounts/CapabilitySelector';
import AlertBox from 'src/components/shared/AlertBox';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import { codeBackground } from 'src/context/Theme';
import { hasLength } from 'src/utils/misc-utils';

const TITLE_ID = 'service-account-grant-dialog';

interface GrantDialogProps {
    open: boolean;
    mode: 'add' | 'edit';
    catalogName: string;
    leaves: string[];
    // For edit mode: the grant being changed.
    initialPrefix?: string;
    initialCapability?: Capability;
    onClose: () => void;
    onSaved: () => void;
}

// Adds a grant, or changes the capability of an existing one. The prefix is
// fixed once a grant exists, so edit mode locks it and only re-adds it with a
// new capability (addServiceAccountGrant upserts).
function GrantDialog({
    open,
    mode,
    catalogName,
    leaves,
    initialPrefix,
    initialCapability,
    onClose,
    onSaved,
}: GrantDialogProps) {
    const [prefix, setPrefix] = useState('');
    const [capability, setCapability] = useState<Capability>('read');
    const [error, setError] = useState<string | null>(null);

    const [{ fetching }, addServiceAccountGrant] = useAddServiceAccountGrant();

    useEffect(() => {
        if (open) {
            setPrefix(mode === 'edit' ? (initialPrefix ?? '') : '');
            setCapability(initialCapability ?? 'read');
            setError(null);
        }
    }, [open, mode, initialPrefix, initialCapability]);

    const handleSave = async () => {
        setError(null);

        if (!hasLength(prefix)) {
            return;
        }

        const result = await addServiceAccountGrant({
            catalogName,
            prefix,
            capability,
        });

        if (result.error) {
            setError(result.error.message);
            return;
        }

        onSaved();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            aria-labelledby={TITLE_ID}
        >
            <DialogTitleWithClose
                id={TITLE_ID}
                onClose={onClose}
                disabled={fetching}
            >
                {mode === 'add' ? 'Add access grant' : 'Edit capability'}
            </DialogTitleWithClose>

            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {error ? (
                        <AlertBox severity="error" short>
                            <Typography>{error}</Typography>
                        </AlertBox>
                    ) : null}

                    {mode === 'add' ? (
                        <LeavesAutocomplete
                            leaves={leaves}
                            value={prefix}
                            onChange={setPrefix}
                            label="Catalog prefix"
                            required
                        />
                    ) : (
                        <Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.75 }}
                            >
                                Catalog prefix
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    alignItems: 'center',
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 1,
                                    color: 'text.secondary',
                                    bgcolor: (theme) =>
                                        codeBackground[theme.palette.mode],
                                }}
                            >
                                <Lock width={15} height={15} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        color: 'text.primary',
                                    }}
                                >
                                    {prefix}
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Capability
                        </Typography>
                        <CapabilitySelector
                            value={capability}
                            onChange={setCapability}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={fetching}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!hasLength(prefix) || fetching}
                    loading={fetching}
                >
                    {mode === 'add' ? 'Add grant' : 'Save capability'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default GrantDialog;
