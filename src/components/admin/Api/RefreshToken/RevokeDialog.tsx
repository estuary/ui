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
    onRevoked?: () => void;
    id: string;
    detail?: string | null;
}

export function RevokeDialog({ open, onClose, onRevoked, id, detail }: Props) {
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
            <DialogTitle>
                <FormattedMessage id="admin.cli_api.refreshToken.revoke.header" />
            </DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {error ? (
                        <Error condensed error={error} severity="error" />
                    ) : null}
                    <Typography>
                        {detail ? (
                            <FormattedMessage
                                id="admin.cli_api.refreshToken.revoke.message.named"
                                values={{ detail }}
                            />
                        ) : (
                            <FormattedMessage id="admin.cli_api.refreshToken.revoke.message" />
                        )}
                    </Typography>
                    <Typography>
                        <FormattedMessage id="admin.cli_api.refreshToken.revoke.permanent" />
                    </Typography>
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
