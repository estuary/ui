import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import MessageWithButton from 'components/content/MessageWithButton';
import AlertBox from 'components/shared/AlertBox';
import CardWrapper from 'components/shared/CardWrapper';
import DataProcessingSetting from 'components/shared/Entity/Details/Overview/NotificationSettings/DataProcessingSetting';
import Error from 'components/shared/Error';
import type { ErrorDetails } from 'components/shared/Error/types';
import useInitializeTaskNotification from 'hooks/notifications/useInitializeTaskNotification';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    taskName: string;
}

function NotificationSettings({ taskName }: Props) {
    const theme = useTheme();
    const aboveMd = useMediaQuery(theme.breakpoints.up('md'));

    const { createSubscription, getNotificationSubscription } =
        useInitializeTaskNotification(taskName);

    const [subscriptionExists, setSubscriptionExists] = useState<
        boolean | null
    >(null);
    const [subscriptionError, setSubscriptionError] =
        useState<ErrorDetails>(null);

    const [updateSettingsError, setUpdateSettingsError] =
        useState<ErrorDetails>(null);

    useEffect(() => {
        getNotificationSubscription().then(
            (response) => {
                if (!response.data || response.data.length === 0) {
                    // Failed to determine whether the user has subscribed to notifications for this prefix
                    // or the user has not subscribed to notifications for this prefix.
                    setSubscriptionExists(false);
                } else {
                    setSubscriptionExists(true);
                }
            },
            () => {
                setSubscriptionExists(false);
            }
        );
    }, [getNotificationSubscription, setSubscriptionExists]);

    const alertsExist = useMemo(
        () =>
            subscriptionError ||
            updateSettingsError ||
            subscriptionExists === false,
        [subscriptionError, subscriptionExists, updateSettingsError]
    );

    return (
        <CardWrapper
            message={
                <FormattedMessage id="details.settings.notifications.header" />
            }
        >
            <Stack spacing={1} sx={{ mb: alertsExist ? 2 : undefined }}>
                {subscriptionError ? (
                    <Error error={subscriptionError} condensed hideTitle />
                ) : null}

                {updateSettingsError ? (
                    <Error error={updateSettingsError} condensed hideTitle />
                ) : null}

                {subscriptionExists === false ? (
                    <AlertBox short severity="info">
                        <MessageWithButton
                            messageId="details.settings.notifications.alert.userNotSubscribed.message"
                            clickHandler={() => {
                                createSubscription().then(
                                    (response) => {
                                        if (
                                            response.data &&
                                            response.data.length > 0
                                        ) {
                                            setSubscriptionExists(true);
                                        } else {
                                            setSubscriptionExists(false);
                                            setSubscriptionError({
                                                message:
                                                    'details.settings.notifications.alert.createSubscriptionFailed.message',
                                            });
                                        }
                                    },
                                    () => {
                                        setSubscriptionExists(false);
                                        setSubscriptionError({
                                            message:
                                                'details.settings.notifications.alert.createSubscriptionFailed.message',
                                        });
                                    }
                                );
                            }}
                        />
                    </AlertBox>
                ) : null}
            </Stack>

            <Box sx={{ width: aboveMd ? 720 : 'unset' }}>
                <DataProcessingSetting
                    errored={updateSettingsError !== null}
                    loading={subscriptionExists === null}
                    setUpdateSettingsError={setUpdateSettingsError}
                    hideBorder
                />
            </Box>
        </CardWrapper>
    );
}

export default NotificationSettings;
