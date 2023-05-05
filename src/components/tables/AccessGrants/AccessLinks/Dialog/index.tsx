import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import AccessLinksTable from 'components/tables/AccessGrants/AccessLinks';
import GenerateInvitation from 'components/tables/AccessGrants/AccessLinks/Dialog/GenerateInvitation';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

const TITLE_ID = 'share-prefix-dialog-title';

interface Props {
    objectRoles: string[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function SharePrefixDialog({ objectRoles, open, setOpen }: Props) {
    const theme = useTheme();

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

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
                    <FormattedMessage id="admin.users.sharePrefix.header" />
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
                <Typography sx={{ mb: 3 }}>
                    <FormattedMessage id="admin.users.sharePrefix.message" />
                </Typography>

                <GenerateInvitation objectRoles={objectRoles} />

                <AccessLinksTable prefixes={objectRoles} />
            </DialogContent>
        </Dialog>
    );
}

export default SharePrefixDialog;
