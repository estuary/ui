import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { useCreateServiceAccountToken } from 'src/api/gql/serviceAccounts';
import SingleLineCode from 'src/components/content/SingleLineCode';
import AlertBox from 'src/components/shared/AlertBox';
import { hasLength } from 'src/utils/misc-utils';

const VALIDITY_OPTIONS = [
    { label: '90 days', value: 'P90D' },
    { label: '180 days', value: 'P180D' },
    { label: '1 year', value: 'P1Y' },
];

interface Props {
    catalogName: string;
}

function CreateApiKeyDialog({ catalogName }: Props) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [validFor, setValidFor] = useState('P90D');
    const [secret, setSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [{ fetching }, createServiceAccountToken] =
        useCreateServiceAccountToken();

    const resetForm = () => {
        setLabel('');
        setValidFor('P90D');
        setSecret(null);
        setError(null);
    };

    const handleClose = () => {
        setOpen(false);
    };

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

    return (
        <>
            <Button
                size="small"
                variant="outlined"
                onClick={() => setOpen(true)}
            >
                Create API Key
            </Button>

            <Dialog
                open={open}
                onClose={secret ? undefined : handleClose}
                maxWidth="xs"
                fullWidth
                slotProps={{
                    transition: { onExited: resetForm },
                }}
            >
                <DialogTitle>
                    {`Create API Key for ${catalogName}`}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {error ? (
                            <AlertBox severity="error" short>
                                <Typography>{error}</Typography>
                            </AlertBox>
                        ) : null}

                        {secret ? (
                            <AlertBox severity="info" short data-private>
                                <Typography sx={{ mb: 1 }}>
                                    Copy this API key now — it will not be shown
                                    again. Use it as the value of FLOW_API_KEY
                                    in your CI/CD environment.
                                </Typography>

                                <SingleLineCode value={secret} />
                            </AlertBox>
                        ) : (
                            <>
                                <TextField
                                    label="Label"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    required
                                    size="small"
                                    fullWidth
                                    placeholder="e.g. GitHub Actions"
                                />

                                <FormControl size="small" fullWidth>
                                    <InputLabel>Lifetime</InputLabel>
                                    <Select
                                        value={validFor}
                                        onChange={(e) =>
                                            setValidFor(e.target.value)
                                        }
                                        label="Lifetime"
                                    >
                                        {VALIDITY_OPTIONS.map((opt) => (
                                            <MenuItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    {secret ? (
                        <Button variant="contained" onClick={handleClose}>
                            Done
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={handleClose}
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
                                Create API Key
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}

export default CreateApiKeyDialog;
