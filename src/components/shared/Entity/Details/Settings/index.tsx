import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import MessageWithButton from 'components/content/MessageWithButton';
import AlertBox from 'components/shared/AlertBox';
import DataProcessingSetting from 'components/shared/Entity/Details/Settings/DataProcessingSetting';
import Error from 'components/shared/Error';
import { ErrorDetails } from 'components/shared/Error/types';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useInitializeTaskNotification from 'hooks/useInitializeTaskNotification';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

function Settings() {
    const theme = useTheme();
    const aboveMd = useMediaQuery(theme.breakpoints.up('md'));

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { createSubscription, getNotificationPreference } =
        useInitializeTaskNotification(catalogName);

    const [subscriptionExists, setSubscriptionExists] = useState<
        boolean | null
    >(null);
    const [subscriptionError, setSubscriptionError] =
        useState<ErrorDetails>(null);

    const [updateSettingsError, setUpdateSettingsError] =
        useState<ErrorDetails>(null);

    useEffect(() => {
        getNotificationPreference().then(
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
    }, [getNotificationPreference, setSubscriptionExists]);

    return (
        <Stack sx={{ mx: 2 }}>
            <Stack sx={{ width: aboveMd ? 720 : 'unset' }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    <FormattedMessage id="details.settings.notifications.header" />
                </Typography>

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
        </Stack>
    );
}

export default Settings;
