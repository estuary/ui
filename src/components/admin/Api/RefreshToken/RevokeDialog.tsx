import type { CombinedError } from 'urql';

import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { useRevokeRefreshToken } from 'src/api/gql/refreshTokens';
import Error from 'src/components/shared/Error';

interface Props {
    open: boolean;
    onClose: () => void;
    id: string;
    detail?: string | null;
}

export function RevokeDialog({ open, onClose, id, detail }: Props) {
    const [, revokeRefreshToken] = useRevokeRefreshToken();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<CombinedError | null>(null);

    const revokeToken = async () => {
        setSaving(true);
        setError(null);

        const result = await revokeRefreshToken({ id });

        if (result.error) {
            setError(result.error);
            setSaving(false);

            return;
        }

        setSaving(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{
                transition: {
                    onExited: () => setError(null),
                },
            }}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>
                Remove Personal Token
            </DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {error ? (
                        <Error condensed error={error} severity="error" />
                    ) : null}
                    <Typography>
                        {detail
                            ? `Remove the personal token "${detail}"?`
                            : 'Remove this personal token?'}
                    </Typography>
                    <Typography>This action is permanent.</Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    <FormattedMessage id="cta.cancel" />
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={revokeToken}
                    disabled={saving}
                    loading={saving}
                >
                    <FormattedMessage id="cta.remove" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
