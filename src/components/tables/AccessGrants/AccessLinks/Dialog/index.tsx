import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import Error from 'components/shared/Error';
import AccessLinksTable from 'components/tables/AccessGrants/AccessLinks';
import GenerateInvitation from 'components/tables/AccessGrants/AccessLinks/Dialog/GenerateInvitation';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const TITLE_ID = 'share-prefix-dialog-title';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function PrefixInvitationDialog({ open, setOpen }: Props) {
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
                    <FormattedMessage id="admin.users.prefixInvitation.header" />
                </Typography>

                <IconButton onClick={closeDialog}>
                    <Cancel
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {/* <Typography sx={{ mb: 3 }}>
                    <FormattedMessage id="admin.users.prefixInvitation.message" />
                </Typography> */}

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
