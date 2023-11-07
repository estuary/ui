import { Stack, useMediaQuery, useTheme } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import MessageWithButton from 'components/content/MessageWithButton';
import AlertBox from 'components/shared/AlertBox';
import DataProcessingSetting from 'components/shared/Entity/Details/Overview/NotificationSettings/DataProcessingSetting';
import Error from 'components/shared/Error';
import { ErrorDetails } from 'components/shared/Error/types';
import useInitializeTaskNotification from 'hooks/useInitializeTaskNotification';
import { useEffect, useState } from 'react';
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
                if (!response.data) {
                    // Failed to determine whether the user has subscribed to notifications for this prefix.
                    setSubscriptionExists(false);
                } else if (response.data.length === 0) {
                    // The user has not subscribed to notifications for this prefix.
                    setSubscriptionExists(false);
                } else {
                    setSubscriptionExists(true);
                }
            },
            (error) => {
                setSubscriptionExists(false);

                console.log('settings init failed', error);
            }
        );
    }, [getNotificationSubscription, setSubscriptionExists]);

    return (
        <CardWrapper
            message={
                <FormattedMessage id="details.settings.notifications.header" />
            }
        >
            <Stack sx={{ width: aboveMd ? 720 : 'unset' }}>
                <Stack spacing={1}>
                    {subscriptionError ? (
                        <Error error={subscriptionError} condensed hideTitle />
                    ) : null}

                    {updateSettingsError ? (
                        <Error
                            error={updateSettingsError}
                            condensed
                            hideTitle
                        />
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

                <DataProcessingSetting
                    errored={updateSettingsError !== null}
                    loading={subscriptionExists === null}
                    setUpdateSettingsError={setUpdateSettingsError}
                    hideBorder
                />
            </Stack>
        </CardWrapper>
    );
}

export default NotificationSettings;
