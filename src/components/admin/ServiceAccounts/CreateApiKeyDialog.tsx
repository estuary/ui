import { useEffect, useState } from 'react';

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

import { useCreateServiceAccountToken } from 'src/api/gql/serviceAccounts';
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

    const [{ fetching }, createServiceAccountToken] =
        useCreateServiceAccountToken();

    useEffect(() => {
        if (open) {
            setLabel('');
            setValidFor(DEFAULT_LIFETIME);
            setSecret(null);
            setError(null);
        }
    }, [open]);

    const handleCreate = async () => {
        setError(null);

        if (!hasLength(label)) {
            return;
        }

        const result = await createServiceAccountToken({
            catalogName,
            detail: label,
            validFor,
        });

        if (result.error || !result.data?.createServiceAccountToken) {
            setError(
                result.error?.message ??
                    'There was an error creating the API key.'
            );
            return;
        }

        setSecret(result.data.createServiceAccountToken.secret);
    };

    const handleRevealDone = () => {
        setSecret(null);
        onClose();
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
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontFamily: 'monospace' }}
                        >
                            {catalogName}
                        </Typography>

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
                            helperText="Helps you recognise this key later."
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
                open={Boolean(secret)}
                secret={secret ?? ''}
                description={label || 'API key'}
                expires={formatExpiryFromNow(validFor)}
                account={catalogName}
                onDone={handleRevealDone}
            />
        </>
    );
}
