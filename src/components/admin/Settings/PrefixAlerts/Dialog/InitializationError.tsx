import { AlertTitle, Box, Stack, Typography } from '@mui/material';
import SafeLoadingButton from 'components/SafeLoadingButton';
import AlertBox from 'components/shared/AlertBox';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { initializeNotificationSubscriptions } from '../useAlertSubscriptionDialog';
import useAlertSubscriptionsStore from '../useAlertSubscriptionsStore';

export default function InitializationError() {
    const serverError = useAlertSubscriptionsStore(
        (state) => state.serverError
    );

    const prefix = useAlertSubscriptionsStore((state) => state.prefix);

    const initializeSubscriptionState = useAlertSubscriptionsStore(
        (state) => state.initializeState
    );

    const [loading, setLoading] = useState(false);

    const retryInitialization = async (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.preventDefault();

        setLoading(true);

        const { data: existingSubscriptions, error } =
            await initializeNotificationSubscriptions(prefix);

        initializeSubscriptionState(prefix, existingSubscriptions, error);
        setLoading(false);
    };

    if (!serverError) {
        return null;
    }

    return (
        <Box style={{ marginBottom: 16 }}>
            <AlertBox
                severity="error"
                short
                title={
                    <AlertTitle>
                        <FormattedMessage id="error.title" />
                    </AlertTitle>
                }
            >
                <Stack spacing={1}>
                    <Typography>
                        <FormattedMessage id="admin.alerts.error.initializationFailed" />
                    </Typography>

                    <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                        <SafeLoadingButton
                            loading={loading}
                            onClick={retryInitialization}
                            size="small"
                            variant="contained"
                        >
                            <FormattedMessage id="cta.restart" />
                        </SafeLoadingButton>
                    </Stack>
                </Stack>
            </AlertBox>
        </Box>
    );
}
