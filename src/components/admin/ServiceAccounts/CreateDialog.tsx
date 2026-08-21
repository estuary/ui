import type { Capability } from 'src/types';

import { useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';

import { useCreateServiceAccount } from 'src/api/gql/serviceAccounts';
import { CapabilitySelector } from 'src/components/admin/ServiceAccounts/CapabilitySelector';
import { IdentityCard } from 'src/components/admin/ServiceAccounts/IdentityCard';
import { usePrefixLeaves } from 'src/components/admin/ServiceAccounts/usePrefixLeaves';
import AlertBox from 'src/components/shared/AlertBox';
import { CatalogPath } from 'src/components/shared/CatalogPath';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { defaultOutline } from 'src/context/Theme';
import { generateAlliterativeName } from 'src/utils/alliterate';
import { hasLength } from 'src/utils/misc-utils';

const TITLE_ID = 'create-service-account';

interface CreateServiceAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (catalogName: string) => void;
}

export function CreateServiceAccountDialog({
    open,
    onClose,
    onCreated,
}: CreateServiceAccountDialogProps) {
    const { leaves, selectedTenant } = usePrefixLeaves();

    const [{ fetching }, createServiceAccount] = useCreateServiceAccount();

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [grantOn, setGrantOn] = useState(true);
    const [quickCapability, setQuickCapability] = useState<Capability>('read');
    const [error, setError] = useState<string | null>(null);

    const regenerateName = () => setName(generateAlliterativeName());

    // Seed the form whenever the dialog opens, or when the tenant arrives after
    // it is already open. This runs during render, so the first frame the user
    // sees already holds the new values. An effect would commit one frame of the
    // previous session's name first, and the preview color would then crossfade
    // away from a name that was never on screen.
    const [seededFor, setSeededFor] = useState({ open, selectedTenant });

    if (
        open !== seededFor.open ||
        selectedTenant !== seededFor.selectedTenant
    ) {
        setSeededFor({ open, selectedTenant });

        if (open) {
            setName(generateAlliterativeName());
            setLocation(selectedTenant);
            setGrantOn(true);
            setQuickCapability('read');
            setError(null);
        }
    }

    const catalogName = `${location}${name}`;
    const identityComplete = hasLength(name) && hasLength(location);

    const handleSubmit = async () => {
        setError(null);

        if (!identityComplete) {
            return;
        }

        const grants = grantOn
            ? [{ prefix: location, capability: quickCapability }]
            : [];

        const result = await createServiceAccount({ catalogName, grants });

        if (result.error) {
            setError(result.error.message);
            return;
        }

        onClose();
        onCreated?.(catalogName);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby={TITLE_ID}
        >
            <DialogTitleWithClose
                id={TITLE_ID}
                onClose={onClose}
                disabled={fetching}
            >
                Create service account
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                >
                    A non-login identity for programmatic access.
                </Typography>
            </DialogTitleWithClose>

            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {error ? (
                        <AlertBox severity="error" short>
                            <Typography>{error}</Typography>
                        </AlertBox>
                    ) : null}

                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderRadius: (theme) => theme.radius.md,
                            bgcolor: (theme) => theme.palette.background.code,
                        }}
                    >
                        <IdentityCard
                            name={name}
                            onNameChange={setName}
                            location={location}
                            onLocationChange={setLocation}
                            // nameHelperText="Lowercase letters, numbers, and dashes"
                            locationHelperText="The home prefix - controls who may manage the service account"
                            leaves={leaves}
                            onRegenerate={regenerateName}
                        />
                    </Box>
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderRadius: (theme) => theme.radius.md,
                            border: (theme) =>
                                defaultOutline[theme.palette.mode],
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={grantOn}
                                    onChange={(event) =>
                                        setGrantOn(event.target.checked)
                                    }
                                />
                            }
                            label="Grant access to the home prefix"
                        />
                        <Collapse in={grantOn}>
                            <>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    sx={{
                                        mt: 1,
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {location ? (
                                        <CatalogPath
                                            path={location}
                                            variant="body2"
                                            color="text.secondary"
                                        />
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            color="text.disabled"
                                        >
                                            No home prefix selected
                                        </Typography>
                                    )}
                                    <CapabilitySelector
                                        value={quickCapability}
                                        onChange={setQuickCapability}
                                    />
                                </Stack>
                            </>
                        </Collapse>{' '}
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 1.5 }}
                        >
                            Grant access to the service account's home prefix.
                            Need different or multiple prefixes? Add grants
                            later from the account details page.
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}
            >
                <Button variant="text" onClick={onClose} disabled={fetching}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!identityComplete || fetching}
                    loading={fetching}
                >
                    Create service account
                </Button>
            </DialogActions>
        </Dialog>
    );
}
