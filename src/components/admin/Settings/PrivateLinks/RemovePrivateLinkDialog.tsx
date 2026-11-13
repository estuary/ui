import type { PrivateLinkDataPlane } from 'src/hooks/privateLinks/usePrivateLinks';
import type { PrivateLink } from 'src/utils/private-link-utils';

import { useState } from 'react';

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
import { getLinkServiceLabel } from 'src/utils/private-link-utils';

interface RemovePrivateLinkDialogProps {
    dataPlane: PrivateLinkDataPlane;
    link: PrivateLink;
    onClose: () => void;
    onRemoved: () => void;
}

export function RemovePrivateLinkDialog({
    dataPlane,
    link,
    onClose,
    onRemoved,
}: RemovePrivateLinkDialogProps) {
    const [, removeLink] = useMutation(REMOVE_PRIVATE_LINK);
    const [removing, setRemoving] = useState(false);
    const [removeError, setRemoveError] = useState<string | null>(null);

    const remove = async () => {
        setRemoveError(null);
        setRemoving(true);
        try {
            const result = await removeLink({ id: link.id });
            if (result.error) {
                setRemoveError(
                    result.error.graphQLErrors[0]?.message ??
                        'The link is still in place. Try again in a moment.'
                );
                return;
            }

            onRemoved();
        } finally {
            setRemoving(false);
        }
    };

    return (
        <Dialog
            open
            maxWidth="xs"
            fullWidth
            onClose={removing ? undefined : onClose}
        >
            <DialogTitle>Remove private link?</DialogTitle>

            <DialogContent>
                <Stack spacing={2}>
                    {removeError ? (
                        <AlertBox
                            short
                            severity="error"
                            title="Couldn't remove private link"
                        >
                            {removeError}
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
                        is removed from {dataPlane.displayName}, and the data
                        plane deletes its endpoint. Captures and
                        materializations that connect through it stop working.
                    </Typography>

                    <Typography>
                        Adding the link again creates a new endpoint, whose
                        connection has to be accepted again and whose address
                        can differ.
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button variant="text" onClick={onClose} disabled={removing}>
                    Cancel
                </Button>
                <Button
                    color="error"
                    onClick={() => void remove()}
                    loading={removing}
                    loadingPosition="start"
                >
                    {removing ? 'Removing…' : 'Remove private link'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
