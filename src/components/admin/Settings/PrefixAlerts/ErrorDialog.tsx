import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { Xmark } from 'iconoir-react';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    headerId: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export function AlertSubscriptionErrorDialog({
    headerId,
    open,
    setOpen,
}: Props) {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            // aria-labelledby={TITLE_ID}
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
                    <FormattedMessage id={headerId} />
                </Typography>

                <IconButton
                    onClick={(event) => {
                        event.preventDefault();

                        setOpen(false);
                    }}
                >
                    <Xmark
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <AlertBox severity="error">
                    <FormattedMessage id="admin.alerts.error.initializationFailed" />
                </AlertBox>
            </DialogContent>
        </Dialog>
    );
}
