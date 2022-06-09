import { Alert, Snackbar, SnackbarProps, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    display: boolean;
    SnackBarProps?: SnackbarProps;
    notificationMessage?: string;
}

function Notifications({ display, notificationMessage, SnackBarProps }: Props) {
    if (notificationMessage) {
        return (
            <Snackbar
                {...SnackBarProps}
                open={display}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                autoHideDuration={10000}
            >
                <Alert severity="error">
                    <Typography component="div">
                        <FormattedMessage id={notificationMessage} />
                    </Typography>
                </Alert>
            </Snackbar>
        );
    } else {
        return null;
    }
}

export default Notifications;
