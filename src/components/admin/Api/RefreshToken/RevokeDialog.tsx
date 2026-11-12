import type { CombinedError } from 'urql';

import { useState } from 'react';

import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { useLeaf } from 'react-semantic-tree';

import { useRevokeRefreshToken } from 'src/api/gql/refreshTokens';
import Error from 'src/components/shared/Error';
import { SemanticDialog as Dialog } from 'src/components/shared/Semantic/Dialog';

interface Props {
    open: boolean;
    onClose: () => void;
    id: string;
    detail?: string | null;
}

export function RevokeDialog({ open, onClose, id, detail }: Props) {
    const { ref: cancelRef } = useLeaf('Cancel');
    const { ref: removeRef } = useLeaf('Remove');
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
            semantic={{ label: 'Revoke Dialog' }}
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
                <Button ref={cancelRef} onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button
                    ref={removeRef}
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
