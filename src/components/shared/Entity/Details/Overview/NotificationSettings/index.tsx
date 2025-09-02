import type { ErrorDetails } from 'src/components/shared/Error/types';

import { useEffect, useMemo, useState } from 'react';

import { Box, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithButton from 'src/components/content/MessageWithButton';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import DataProcessingSetting from 'src/components/shared/Entity/Details/Overview/NotificationSettings/DataProcessingSetting';
import Error from 'src/components/shared/Error';
import useInitializeTaskNotification from 'src/hooks/notifications/useInitializeTaskNotification';

interface Props {
    taskName: string;
}

function NotificationSettings({ taskName }: Props) {
    const intl = useIntl();

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
            message={intl.formatMessage({
                id: 'details.settings.notifications.header',
            })}
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

            <Box>
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
