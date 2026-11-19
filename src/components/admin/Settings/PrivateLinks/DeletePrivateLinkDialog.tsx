import type { PrivateLinkDataPlane } from 'src/hooks/privateLinks/usePrivateLinks';
import type { PrivateLink } from 'src/utils/private-link-utils';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { useMutation } from 'urql';

import { REMOVE_PRIVATE_LINK } from 'src/api/gql/privateLinks';
import AlertBox from 'src/components/shared/AlertBox';
import { normalizeError } from 'src/utils/errors';
import { getLinkServiceLabel } from 'src/utils/private-link-utils';

interface DeletePrivateLinkDialogProps {
    dataPlane: PrivateLinkDataPlane;
    link: PrivateLink;
    onClose: () => void;
    onDeleted: () => void;
}

export function DeletePrivateLinkDialog({
    dataPlane,
    link,
    onClose,
    onDeleted,
}: DeletePrivateLinkDialogProps) {
    const [{ fetching, error }, removeLink] = useMutation(REMOVE_PRIVATE_LINK);

    const remove = async () => {
        const result = await removeLink({ id: link.id });
        if (!result.error) {
            onDeleted();
        }
    };

    return (
        <Dialog
            open
            maxWidth="xs"
            fullWidth
            aria-labelledby="delete-private-link-title"
            onClose={fetching ? undefined : onClose}
        >
            <DialogTitle id="delete-private-link-title">
                Delete private link?
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2}>
                    {error ? (
                        <AlertBox short severity="error" title="Request failed">
                            {normalizeError(error)?.message}
                        </AlertBox>
                    ) : null}

                    <Typography>
                        The link to{' '}
                        <Box
                            component="span"
                            sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}
                        >
                            {getLinkServiceLabel(link.config)}
                        </Box>{' '}
                        will be deleted from {dataPlane.displayName} and the
                        data plane will delete its endpoint. Captures and
                        materializations that connect through it stop working.
                    </Typography>

                    <Typography>
                        Adding the link again may create a new endpoint with a
                        different address and require you to accept a new
                        connection.
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button variant="text" onClick={onClose} disabled={fetching}>
                    Cancel
                </Button>
                <Button
                    color="error"
                    onClick={() => void remove()}
                    loading={fetching}
                    loadingPosition="start"
                >
                    {fetching ? 'Deleting…' : 'Delete private link'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
