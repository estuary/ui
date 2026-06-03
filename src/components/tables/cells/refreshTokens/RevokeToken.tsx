import type { CombinedError } from 'urql';

import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TableCell,
    Typography,
} from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import { useDeleteRefreshToken } from 'src/api/gql/refreshTokens';
import Error from 'src/components/shared/Error';

interface Props {
    id: string;
    detail?: string | null;
}

function RevokeTokenButton({ id, detail }: Props) {
    const intl = useIntl();

    const [, deleteRefreshToken] = useDeleteRefreshToken();

    const [confirmOpen, setConfirmOpen] = useState(false);
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
        setConfirmOpen(false);
    };

    return (
        <TableCell>
            <Button
                color="error"
                onClick={() => setConfirmOpen(true)}
                variant="text"
            >
                {intl.formatMessage({ id: 'cta.remove' })}
            </Button>

            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                TransitionProps={{
                    onExited: () => setError(null),
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
                                    id="admin.cli_api.refreshToken.revoke.message"
                                    values={{ detail }}
                                />
                            ) : (
                                <FormattedMessage id="admin.cli_api.refreshToken.revoke.message.noDetail" />
                            )}
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        disabled={saving}
                    >
                        {intl.formatMessage({ id: 'cta.cancel' })}
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={revokeToken}
                        disabled={saving}
                        loading={saving}
                    >
                        {intl.formatMessage({ id: 'cta.remove' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </TableCell>
    );
}

export default RevokeTokenButton;
