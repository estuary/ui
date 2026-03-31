import type { AlertSubscriptionDialogProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import AlertTypeField from 'src/components/admin/Settings/PrefixAlerts/Dialog/AlertTypeField';
import DeleteButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/DeleteButton';
import EmailListField from 'src/components/admin/Settings/PrefixAlerts/Dialog/EmailListField';
import PrefixField from 'src/components/admin/Settings/PrefixAlerts/Dialog/PrefixField';
import SaveButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/SaveButton';
import ServerErrors from 'src/components/admin/Settings/PrefixAlerts/Dialog/ServerErrors';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useGetAlertSubscriptions } from 'src/context/AlertSubscriptions';

const TITLE_ID = 'alert-subscription-dialog-title';

const AlertSubscriptionDialog = ({
    descriptionId,
    enableDeletion,
    existingAlertTypes,
    headerId,
    open,
    setOpen,
    staticEmail,
    staticPrefix,
}: AlertSubscriptionDialogProps) => {
    const intl = useIntl();
    const theme = useTheme();

    const [_response, executeQuery] = useGetAlertSubscriptions();

    const resetSubscriptionState = useAlertSubscriptionsStore(
        (state) => state.resetState
    );

    const closeDialog = (queryTrigger?: boolean) => {
        if (queryTrigger) {
            executeQuery({ requestPolicy: 'network-only' });
        }

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
                    {intl.formatMessage({ id: descriptionId })}
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

                    <EmailListField staticEmail={staticEmail} />

                    <AlertTypeField existingAlertTypes={existingAlertTypes} />
                </Grid>
            </DialogContent>

            <DialogActions
                style={{
                    justifyContent: enableDeletion
                        ? 'space-between'
                        : 'flex-end',
                }}
            >
                {enableDeletion ? (
                    <DeleteButton closeDialog={() => closeDialog(true)} />
                ) : null}

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => closeDialog()}
                    >
                        {intl.formatMessage({ id: 'cta.cancel' })}
                    </Button>

                    <SaveButton closeDialog={() => closeDialog(true)} />
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default AlertSubscriptionDialog;
