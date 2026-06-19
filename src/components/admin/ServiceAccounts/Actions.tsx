import type { ServiceAccount } from 'src/gql-types/graphql';

import { useRef, useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import {
    useDisableServiceAccount,
    useEnableServiceAccount,
} from 'src/api/gql/serviceAccounts';
import Error from 'src/components/shared/Error';

interface Props {
    serviceAccount: Pick<ServiceAccount, 'id' | 'displayName' | 'disabledAt'>;
}

function ServiceAccountActions({ serviceAccount }: Props) {
    const isDisabled = Boolean(serviceAccount.disabledAt);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const disabledAtOpen = useRef(isDisabled);

    const [{ fetching: disabling }, disableServiceAccount] =
        useDisableServiceAccount();
    const [{ fetching: enabling }, enableServiceAccount] =
        useEnableServiceAccount();

    const busy = disabling || enabling;

    const handleToggle = async () => {
        setError(null);

        if (disabledAtOpen.current) {
            const result = await enableServiceAccount({
                id: serviceAccount.id,
            });

            if (result.error) {
                setError(result.error.message);
                return;
            }

            setConfirmOpen(false);
        } else {
            const result = await disableServiceAccount({
                id: serviceAccount.id,
            });

            if (result.error) {
                setError(result.error.message);
                return;
            }

            setConfirmOpen(false);
        }
    };

    return (
        <>
            <Button
                size="small"
                variant="text"
                color={isDisabled ? 'primary' : 'error'}
                onClick={() => {
                    disabledAtOpen.current = isDisabled;
                    setConfirmOpen(true);
                }}
            >
                {isDisabled ? 'Restore' : 'Disable'}
            </Button>

            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                maxWidth="xs"
                fullWidth
                slotProps={{
                    transition: { onExited: () => setError(null) },
                }}
            >
                <DialogTitle>
                    {disabledAtOpen.current
                        ? 'Restore Service Account'
                        : 'Disable Service Account'}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={1}>
                        {error ? (
                            <Error
                                condensed
                                error={{ message: error }}
                                severity="error"
                            />
                        ) : null}
                        <Typography>
                            {disabledAtOpen.current
                                ? `Restore "${serviceAccount.displayName}"? This will not restore previously revoked API keys — you must create new ones.`
                                : `Disable "${serviceAccount.displayName}"?`}
                        </Typography>

                        {!disabledAtOpen.current ? (
                            <Typography variant="body2" color="warning.main">
                                All active API keys will be permanently revoked.
                                You will need to create new keys if you restore
                                this account.
                            </Typography>
                        ) : null}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        disabled={busy}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outlined"
                        color={disabledAtOpen.current ? 'primary' : 'error'}
                        onClick={handleToggle}
                        disabled={busy}
                        loading={busy}
                    >
                        {disabledAtOpen.current ? 'Restore' : 'Disable'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ServiceAccountActions;
