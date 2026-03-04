import type { AlertSubscriptionDialogProps } from 'src/components/admin/Settings/PrefixAlerts/types';

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

import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import AlertTypeField from 'src/components/admin/Settings/PrefixAlerts/Dialog/AlertTypeField';
import EmailListField from 'src/components/admin/Settings/PrefixAlerts/Dialog/EmailListField';
import PrefixField from 'src/components/admin/Settings/PrefixAlerts/Dialog/PrefixField';
import SaveButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/SaveButton';
import ServerErrors from 'src/components/admin/Settings/PrefixAlerts/Dialog/ServerErrors';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

const TITLE_ID = 'alert-subscription-dialog-title';

function AlertSubscriptionDialog({
    executeQuery,
    headerId,
    open,
    setOpen,
    staticPrefix,
}: AlertSubscriptionDialogProps) {
    const intl = useIntl();
    const theme = useTheme();

    const resetSubscriptionState = useAlertSubscriptionsStore(
        (state) => state.resetState
    );

    const closeDialog = (queryTrigger?: boolean) => {
        setOpen(false);
        resetSubscriptionState();

        if (queryTrigger) {
            executeQuery({ requestPolicy: 'network-only' });
        }
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
                    {intl.formatMessage({ id: headerId })}
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
                    {intl.formatMessage({
                        id: 'alerts.config.dialog.description',
                    })}
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

                    <AlertTypeField />

                    <EmailListField />
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
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>

                <SaveButton closeDialog={() => closeDialog(true)} />
            </DialogActions>
        </Dialog>
    );
}

export default AlertSubscriptionDialog;
