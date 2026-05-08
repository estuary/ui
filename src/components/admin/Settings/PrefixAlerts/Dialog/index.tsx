import type { AlertSubscriptionDialogProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import DeleteButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/DeleteButton';
import PrefixField from 'src/components/admin/Settings/PrefixAlerts/Dialog/PrefixField';
import SaveButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/SaveButton';
import ServerErrors from 'src/components/admin/Settings/PrefixAlerts/Dialog/ServerErrors';
import SubscriberSection from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import MessageWithLink from 'src/components/content/MessageWithLink';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';

const TITLE_ID = 'alert-subscription-dialog-title';

const AlertSubscriptionDialog = ({
    descriptionId,
    enableDeletion,
    headerId,
    open,
    setOpen,
    staticEmail,
    staticPrefix,
}: AlertSubscriptionDialogProps) => {
    const intl = useIntl();

    const resetSubscriptionState = useAlertSubscriptionsStore(
        (state) => state.resetState
    );

    const closeDialog = () => {
        setOpen(false);
        resetSubscriptionState();
    };

    useUnmount(() => {
        resetSubscriptionState();
    });

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
            <DialogTitleWithClose id={TITLE_ID} onClose={closeDialog}>
                {intl.formatMessage({ id: headerId })}
            </DialogTitleWithClose>

            <DialogContent sx={{ mt: 1 }}>
                <ServerErrors />

                <Box style={{ marginBottom: 16 }}>
                    <MessageWithLink messageID={descriptionId} />
                </Box>

                <Stack spacing={4}>
                    <PrefixField staticPrefix={staticPrefix} />

                    <SubscriberSection />
                </Stack>
            </DialogContent>

            <DialogActions
                style={{
                    justifyContent: enableDeletion
                        ? 'space-between'
                        : 'flex-end',
                }}
            >
                {enableDeletion ? (
                    <DeleteButton closeDialog={() => closeDialog()} />
                ) : null}

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => closeDialog()}
                    >
                        {intl.formatMessage({ id: 'cta.cancel' })}
                    </Button>

                    <SaveButton closeDialog={() => closeDialog()} />
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default AlertSubscriptionDialog;
