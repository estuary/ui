import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import SaveButton from 'components/admin/Settings/PrefixAlerts/Dialog/SaveButton';
import { Xmark } from 'iconoir-react';
import type { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import useAlertSubscriptionsStore from '../useAlertSubscriptionsStore';
import EmailListField from './EmailListField';
import PrefixField from './PrefixField';
import ServerErrors from './ServerErrors';

interface Props {
    headerId: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    staticPrefix?: string;
}

const TITLE_ID = 'alert-subscription-dialog-title';

function AlertSubscriptionDialog({
    headerId,
    open,
    setOpen,
    staticPrefix,
}: Props) {
    const theme = useTheme();

    const resetSubscriptionState = useAlertSubscriptionsStore(
        (state) => state.resetState
    );

    const closeDialog = () => {
        setOpen(false);
        resetSubscriptionState();
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
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

                        closeDialog();
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

            <DialogContent sx={{ mt: 1 }}>
                <ServerErrors />

                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="admin.alerts.dialog.description" />
                </Typography>

                <Grid
                    container
                    spacing={2}
                    sx={{
                        mb: 3,
                        pt: 1,
                        alignItems: 'flex-start',
                    }}
                >
                    <PrefixField staticPrefix={staticPrefix} />

                    <EmailListField open={open} />
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={(event) => {
                        event.preventDefault();

                        closeDialog();
                    }}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <SaveButton closeDialog={closeDialog} />
            </DialogActions>
        </Dialog>
    );
}

export default AlertSubscriptionDialog;
