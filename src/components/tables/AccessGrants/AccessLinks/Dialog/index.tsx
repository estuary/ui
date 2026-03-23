import type { Dispatch, SetStateAction } from 'react';
import type { CombinedError } from 'urql';

import { useState } from 'react';

import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';

import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import Error from 'src/components/shared/Error';
import { AccessLinksTable } from 'src/components/tables/AccessGrants/AccessLinks';
import { GenerateInvitation } from 'src/components/tables/AccessGrants/AccessLinks/Dialog/GenerateInvitation';

export interface InviteErrorProps {
    setError: Dispatch<SetStateAction<CombinedError | null>>;
}

interface PrefixInvitationDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TITLE_ID = 'share-prefix-dialog-title';

function PrefixInvitationDialog({
    open,
    setOpen,
}: PrefixInvitationDialogProps) {
    const intl = useIntl();
    const theme = useTheme();

    const [error, setError] = useState<CombinedError | null>(null);
    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setError(null);
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            aria-labelledby={TITLE_ID}
            onClose={closeDialog}
        >
            <DialogTitle
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6">
                    {intl.formatMessage({
                        id: 'admin.users.prefixInvitation.header',
                    })}
                </Typography>

                <IconButton onClick={closeDialog}>
                    <Xmark
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {error ? (
                    <Box sx={{ mb: 3 }}>
                        <Error
                            error={error}
                            condensed={true}
                            hideTitle={true}
                        />
                    </Box>
                ) : null}

                <GenerateInvitation setError={setError} />

                <AccessLinksTable setError={setError} />
            </DialogContent>
        </Dialog>
    );
}

export default PrefixInvitationDialog;
