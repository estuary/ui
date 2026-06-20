import { useEffect, useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';

import { CheckCircle } from 'iconoir-react';

import SingleLineCode from 'src/components/content/SingleLineCode';
import AlertBox from 'src/components/shared/AlertBox';

interface SecretRevealModalProps {
    open: boolean;
    secret: string;
    description: string;
    // Pre-formatted expiry, e.g. "Sep 17, 2026" or "1 year".
    expires: string;
    // The owning account's catalog name.
    account: string;
    onDone: () => void;
}

const META_LABEL_SX = {
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: 'text.secondary',
} as const;

// Shows a freshly minted API key exactly once. The user must acknowledge they
// stored it before they can dismiss the dialog (no close affordance otherwise).
export function SecretRevealModal({
    open,
    secret,
    description,
    expires,
    account,
    onDone,
}: SecretRevealModalProps) {
    const [acknowledged, setAcknowledged] = useState(false);

    useEffect(() => {
        if (open) {
            setAcknowledged(false);
        }
    }, [open]);

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogContent>
                <Stack spacing={2.5}>
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center' }}
                    >
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                flex: 'none',
                                borderRadius: (theme) => theme.radius.md,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: (theme) =>
                                    theme.palette.success.alpha_12,
                                color: 'success.main',
                            }}
                        >
                            <CheckCircle />
                        </Box>
                        <Box>
                            <Typography variant="h6">
                                API key created
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {description}
                            </Typography>
                        </Box>
                    </Stack>

                    <AlertBox severity="warning" title="Copy your key now" short>
                        <Typography>
                            This secret will not be shown again. Store it
                            somewhere safe before closing this dialog. Use it as
                            the value of FLOW_API_KEY in your CI/CD environment.
                        </Typography>
                    </AlertBox>

                    <Box data-private>
                        <SingleLineCode value={secret} />
                    </Box>

                    <Stack direction="row" spacing={3}>
                        <Box>
                            <Typography component="div" sx={META_LABEL_SX}>
                                Expires
                            </Typography>
                            <Typography variant="body2">{expires}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography component="div" sx={META_LABEL_SX}>
                                Account
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ fontFamily: 'monospace' }}
                            >
                                {account}
                            </Typography>
                        </Box>
                    </Stack>

                    <Box
                        sx={{
                            pt: 2,
                            borderTop: (theme) =>
                                `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={acknowledged}
                                    onChange={(event) =>
                                        setAcknowledged(event.target.checked)
                                    }
                                />
                            }
                            label="I’ve copied my API key and stored it securely"
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="contained"
                    onClick={onDone}
                    disabled={!acknowledged}
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
}
