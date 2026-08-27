import { useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { useCreateApiKey } from 'src/api/gql/serviceAccounts';
import { LifetimeSelector } from 'src/components/admin/ServiceAccounts/LifetimeSelector';
import { SecretRevealModal } from 'src/components/admin/ServiceAccounts/SecretRevealModal';
import {
    DEFAULT_LIFETIME,
    formatExpiryFromNow,
} from 'src/components/admin/ServiceAccounts/shared';
import AlertBox from 'src/components/shared/AlertBox';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { hasLength } from 'src/utils/misc-utils';

const TITLE_ID = 'create-service-account-api-key';

interface CreateApiKeyDialogProps {
    open: boolean;
    catalogName: string;
    onClose: () => void;
}

export function CreateApiKeyDialog({
    open,
    catalogName,
    onClose,
}: CreateApiKeyDialogProps) {
    const [label, setLabel] = useState('');
    const [validFor, setValidFor] = useState(DEFAULT_LIFETIME);
    const [secret, setSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [{ fetching }, createApiKey] = useCreateApiKey();

    // Seed the form whenever the dialog opens. This runs during render, so the
    // first frame the user sees already holds the fresh values. An effect would
    // paint one frame of the previous session first: its leftover label briefly
    // enables the Create button before the reset lands.
    const [seededFor, setSeededFor] = useState(open);

    if (open !== seededFor) {
        setSeededFor(open);

        if (open) {
            setLabel('');
            setValidFor(DEFAULT_LIFETIME);
            setSecret(null);
            setError(null);
        }
    }

    const handleCreate = async () => {
        setError(null);

        if (!hasLength(label)) {
            return;
        }

        const result = await createApiKey({
            catalogName,
            detail: label,
            validFor,
        });

        if (result.error || !result.data?.createApiKey) {
            setError(
                result.error?.message ??
                    'There was an error creating the API key.'
            );
            return;
        }

        setSecret(result.data.createApiKey.secret);
    };

    return (
        <>
            <Dialog
                open={Boolean(open && !secret)}
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
                    Create API key
                </DialogTitleWithClose>

                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {error ? (
                            <AlertBox severity="error" short>
                                <Typography>{error}</Typography>
                            </AlertBox>
                        ) : null}

                        <TextField
                            label="Description"
                            value={label}
                            onChange={(event) => setLabel(event.target.value)}
                            required
                            size="small"
                            fullWidth
                            placeholder="CI deploy pipeline"
                            helperText="Helps you recognize this key later."
                        />

                        <Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Lifetime
                            </Typography>
                            <LifetimeSelector
                                value={validFor}
                                onChange={setValidFor}
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
                        onClick={handleCreate}
                        disabled={!hasLength(label) || fetching}
                        loading={fetching}
                    >
                        Create key
                    </Button>
                </DialogActions>
            </Dialog>

            <SecretRevealModal
                open={Boolean(open && secret)}
                secret={secret ?? ''}
                description={label || 'API key'}
                expires={formatExpiryFromNow(validFor)}
                account={catalogName}
                onDone={onClose}
                onExited={() => setSecret(null)}
            />
        </>
    );
}
