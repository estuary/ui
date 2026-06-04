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

import { useDeleteRefreshToken } from 'src/api/gql/refreshTokens';
import Error from 'src/components/shared/Error';

interface Props {
    open: boolean;
    onClose: () => void;
    onRevoked?: () => void;
    id: string;
    detail?: string | null;
}

export function RevokeDialog({ open, onClose, onRevoked, id, detail }: Props) {
    const [, deleteRefreshToken] = useDeleteRefreshToken();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<CombinedError | null>(null);

    const revokeToken = async () => {
        setSaving(true);
        setError(null);

        const result = await deleteRefreshToken({ id });

        if (result.error) {
            setError(result.error);
            setSaving(false);

            return;
        }

        setSaving(false);
        onClose();
        onRevoked?.();
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
            <DialogTitle>Remove Refresh Token</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {error ? (
                        <Error condensed error={error} severity="error" />
                    ) : null}
                    <Typography>
                        {detail
                            ? `Remove the refresh token "${detail}"?`
                            : 'Remove this refresh token?'}
                    </Typography>
                    <Typography>This action is permanent.</Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={revokeToken}
                    disabled={saving}
                    loading={saving}
                >
                    Remove
                </Button>
            </DialogActions>
        </Dialog>
    );
}
