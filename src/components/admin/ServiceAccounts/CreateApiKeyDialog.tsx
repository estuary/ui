import type { ReactNode } from 'react';

import { useLayoutEffect, useRef, useState } from 'react';

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
import { SecretReveal } from 'src/components/admin/ServiceAccounts/SecretReveal';
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

// Everything the reveal phase shows, snapshotted when the key is created. The
// expiry is fixed at mint time, and the reveal never reads the live form.
interface RevealedKey {
    secret: string;
    description: string;
    expires: string;
}

// Animates the dialog's height across the phase swap, using the mechanism
// from WizardContent: the outer box holds an explicit height measured off the
// content, and transitions it only while a swap is in flight so in-phase
// resizes stay instant. Rendered inside the Dialog, so the measured height
// unmounts with it and a reopen starts fresh.
function AnimatedHeight({
    switchKey,
    children,
}: {
    // The phase discriminator; a change animates the next height difference.
    switchKey: string;
    children: ReactNode;
}) {
    const innerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [transitioning, setTransitioning] = useState(false);
    const prevKeyRef = useRef(switchKey);

    useLayoutEffect(() => {
        if (prevKeyRef.current !== switchKey) {
            setTransitioning(true);
            prevKeyRef.current = switchKey;
        }

        const el = innerRef.current;

        if (!el) {
            return undefined;
        }

        setHeight(el.scrollHeight);

        const observer = new ResizeObserver(() => {
            setHeight(el.scrollHeight);
        });
        observer.observe(el);

        return () => observer.disconnect();
    }, [switchKey]);

    return (
        <Box
            onTransitionEnd={() => setTransitioning(false)}
            sx={{
                height: height ?? 'auto',
                // The incoming content renders at full size immediately; the
                // box catches up. Clipping only during the catch-up keeps the
                // taller content from spilling out of the paper.
                overflow: transitioning ? 'hidden' : undefined,
                transition: transitioning
                    ? (theme) => theme.transitions.create('height')
                    : 'none',
            }}
        >
            <Box ref={innerRef}>{children}</Box>
        </Box>
    );
}

// One dialog, two phases: the form, then - once a key is minted - the one-time
// secret reveal in its place. The reveal phase has no close affordance and
// ignores backdrop and Escape, so the key cannot be dismissed unseen.
export function CreateApiKeyDialog({
    open,
    catalogName,
    onClose,
}: CreateApiKeyDialogProps) {
    const [label, setLabel] = useState('');
    const [validFor, setValidFor] = useState(DEFAULT_LIFETIME);
    const [revealed, setRevealed] = useState<RevealedKey | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [{ fetching }, createApiKey] = useCreateApiKey();

    // Runs once the dialog has fully faded out, so no visible frame holds the
    // reset. The next open starts a fresh session.
    const resetSession = () => {
        setLabel('');
        setValidFor(DEFAULT_LIFETIME);
        setError(null);
        setRevealed(null);
    };

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

        setRevealed({
            secret: result.data.createApiKey.secret,
            description: label || 'API key',
            expires: formatExpiryFromNow(validFor),
        });
    };

    return (
        <Dialog
            open={open}
            onClose={revealed ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby={TITLE_ID}
            slotProps={{
                transition: { onExited: resetSession },
            }}
        >
            <AnimatedHeight switchKey={revealed ? 'reveal' : 'form'}>
                {revealed ? (
                    <SecretReveal
                        secret={revealed.secret}
                        description={revealed.description}
                        expires={revealed.expires}
                        titleId={TITLE_ID}
                        onDone={onClose}
                    />
                ) : (
                    <>
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
                                    onChange={(event) =>
                                        setLabel(event.target.value)
                                    }
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
                    </>
                )}
            </AnimatedHeight>
        </Dialog>
    );
}
