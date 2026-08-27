import { useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
    Typography,
} from '@mui/material';

import { CheckCircle } from 'iconoir-react';

import AlertBox from 'src/components/shared/AlertBox';
import { CopyValueField } from 'src/components/shared/CopyValueField';

interface SecretRevealModalProps {
    open: boolean;
    secret: string;
    description: string;
    // Pre-formatted expiry, e.g. "Sep 17, 2026" or "1 year".
    expires: string;
    // The owning account's catalog name.
    account: string;
    onDone: () => void;
    /**
     * Called once the exit transition finishes. The dialog's content stays on
     * screen through the fade-out, so the owner clears the secret here, not
     * in onDone.
     */
    onExited?: () => void;
}

// Shows a freshly minted API key exactly once. The user must acknowledge they
// stored it before they can dismiss the dialog (no close affordance otherwise).
export function SecretRevealModal({
    open,
    secret,
    description,
    expires,
    account,
    onDone,
    onExited,
}: SecretRevealModalProps) {
    // Dismissing loses the secret for good, so the dialog holds until it has
    // been copied. The flag resets after the exit transition, so the unlocked
    // Done button keeps its state through the fade-out.
    const [copied, setCopied] = useState(false);

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            slotProps={{
                transition: {
                    onExited: () => {
                        setCopied(false);
                        onExited?.();
                    },
                },
            }}
        >
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
                            <Typography variant="body2" color="text.secondary">
                                {description} - Expires {expires}
                            </Typography>
                        </Box>
                    </Stack>

                    <AlertBox
                        severity="warning"
                        title="Copy your key now"
                        short
                    >
                        <Typography>
                            This secret will not be provided again. Store it
                            somewhere safe before closing this dialog. Use it as
                            the value of FLOW_API_KEY in your CI/CD environment.
                        </Typography>
                    </AlertBox>

                    {/* data-private keeps the revealed secret out of the
                        LogRocket session replay. */}
                    <Box data-private>
                        <CopyValueField
                            label="API key"
                            value={secret}
                            source="SecretRevealModal"
                            onCopied={() => setCopied(true)}
                            valueSx={{
                                wordBreak: 'break-all',
                                lineHeight: 1.4,
                            }}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="contained" onClick={onDone} disabled={!copied}>
                    {copied ? 'Done' : 'Copy and save your key first'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
