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
import AlertBox from 'components/shared/AlertBox';
import Error from 'components/shared/Error';
import GenerateGrant from 'components/tables/AccessGrants/DataSharing/Dialog/GenerateGrant';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';

const TITLE_ID = 'share-data-dialog-title';

interface Props {
    objectRoles: string[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function ShareDataDialog({ objectRoles, open, setOpen }: Props) {
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
                    <FormattedMessage id="admin.prefix.issueGrant.header" />
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
                    <FormattedMessage id="admin.prefix.issueGrant.message" />
                </Typography> */}

                {serverError ? (
                    <Box sx={{ mb: 3 }}>
                        {serverError.code === '42501' ? (
                            <AlertBox severity="error" short>
                                <Typography>
                                    <FormattedMessage id="admin.prefix.issueGrant.error.invalidPrefix" />
                                </Typography>
                            </AlertBox>
                        ) : (
                            <Error
                                error={serverError}
                                condensed={true}
                                hideTitle={true}
                            />
                        )}
                    </Box>
                ) : null}

                <GenerateGrant
                    objectRoles={objectRoles}
                    serverError={serverError}
                    setServerError={setServerError}
                    setOpen={setOpen}
                />
            </DialogContent>
        </Dialog>
    );
}

export default ShareDataDialog;
