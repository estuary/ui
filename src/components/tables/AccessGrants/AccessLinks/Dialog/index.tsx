import type { PostgrestError } from '@supabase/postgrest-js';
import type { Dispatch, SetStateAction } from 'react';

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
import AccessLinksTable from 'src/components/tables/AccessGrants/AccessLinks';
import GenerateInvitation from 'src/components/tables/AccessGrants/AccessLinks/Dialog/GenerateInvitation';

const TITLE_ID = 'share-prefix-dialog-title';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function PrefixInvitationDialog({ open, setOpen }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const [serverError, setServerError] = useState<PostgrestError | null>(null);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setServerError(null);
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
                {serverError ? (
                    <Box sx={{ mb: 3 }}>
                        <Error
                            error={serverError}
                            condensed={true}
                            hideTitle={true}
                        />
                    </Box>
                ) : null}

                <GenerateInvitation
                    serverError={serverError}
                    setServerError={setServerError}
                />

                <AccessLinksTable />
            </DialogContent>
        </Dialog>
    );
}

export default PrefixInvitationDialog;
