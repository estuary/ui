import type { AlertSubscriptionDialogProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
} from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';
import { useUnmount } from 'react-use';

import DeleteButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/DeleteButton';
import GlobalSettings from 'src/components/admin/Settings/PrefixAlerts/Dialog/GlobalSettings';
import PrefixField from 'src/components/admin/Settings/PrefixAlerts/Dialog/PrefixField';
import SaveButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/SaveButton';
import ServerErrors from 'src/components/admin/Settings/PrefixAlerts/Dialog/ServerErrors';
import SubscriberSection from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/index';
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
    staticPrefix,
}: AlertSubscriptionDialogProps) => {
    const { ref: semanticCloseRef } =
        useSemanticLeaf<HTMLButtonElement>('Close');

    const { ref: semanticCancelRef } =
        useSemanticLeaf<HTMLButtonElement>('Cancel');

    const resetSubscriptionState = useAlertSubscriptionsStore(
        (state) => state.resetState
    );
    const initializationErrors = useAlertSubscriptionsStore(
        (state) => state.initializationErrors
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
            <DialogTitleWithClose
                closeButtonRef={semanticCloseRef}
                id={TITLE_ID}
                onClose={closeDialog}
            >
                {headerId === 'alerts.config.dialog.update.header'
                    ? 'Update Notification Methods'
                    : 'Configure Notification Methods'}
            </DialogTitleWithClose>

            <DialogContent sx={{ mt: 1 }}>
                <ServerErrors />

                {initializationErrors.length > 0 ? null : (
                    <>
                        <Box style={{ marginBottom: 16 }}>
                            <MessageWithLink messageID={descriptionId} />
                        </Box>

                        <Stack spacing={4}>
                            <PrefixField staticPrefix={staticPrefix} />

                            <GlobalSettings />

                            <SubscriberSection />
                        </Stack>
                    </>
                )}
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
                        ref={semanticCancelRef}
                        variant="outlined"
                        size="small"
                        onClick={() => closeDialog()}
                    >
                        Cancel
                    </Button>

                    <SaveButton closeDialog={() => closeDialog()} />
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default AlertSubscriptionDialog;
