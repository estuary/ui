import { useState } from 'react';

import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    Stack,
    Typography,
} from '@mui/material';

import { CheckCircle } from 'iconoir-react';

import AlertBox from 'src/components/shared/AlertBox';
import { CopyValueField } from 'src/components/shared/CopyValueField';

interface SecretRevealProps {
    secret: string;
    description: string;
    // Pre-formatted expiry, e.g. "Sep 17, 2026" or "1 year".
    expires: string;
    // The heading's element id, for the owning Dialog's aria-labelledby.
    titleId: string;
    onDone: () => void;
}

// The reveal phase of the create API key dialog: shows a freshly minted key
// exactly once. Dismissing loses the secret for good, so Done stays locked
// until the key has been copied. The copied gate needs no reset - this
// component unmounts with its dialog.
export function SecretReveal({
    secret,
    description,
    expires,
    titleId,
    onDone,
}: SecretRevealProps) {
    const [copied, setCopied] = useState(false);

    return (
        <>
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
                            <Typography id={titleId} variant="h6">
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
                            source="SecretReveal"
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
        </>
    );
}
