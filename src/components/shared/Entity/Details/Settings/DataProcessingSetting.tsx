import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    NotificationQuery,
    createNotification,
    deleteNotification,
    getNotificationMessage,
    updateNotificationInterval,
} from 'api/alerts';
import { defaultOutline } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useInitializeTaskNotification from 'hooks/useInitializeTaskNotification';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    messageName: string;
    liveSpecId: string | null;
    preferenceId: string | null;
    hideBorder?: boolean;
}

const intervalOptionId = {
    id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.intervalOptions',
};

function DataProcessingSetting({
    liveSpecId,
    preferenceId,
    messageName,
    hideBorder,
}: Props) {
    const intl = useIntl();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const [notification, setNotification] = useState<
        NotificationQuery | null | undefined
    >(undefined);
    const [messageId, setMessageId] = useState<string | null>(null);

    const { getNotificationSubscription } =
        useInitializeTaskNotification(catalogName);

    useEffect(() => {
        getNotificationMessage({ value: messageName, column: 'detail' }).then(
            (response) => {
                if (response.data && response.data.length > 0) {
                    setMessageId(response.data[0].id);
                } else {
                    setNotification(null);
                }
            },
            () => {
                console.log('init message error');
                setNotification(null);
            }
        );
    }, [messageName, setMessageId, setNotification]);

    useEffect(() => {
        if (
            liveSpecId &&
            preferenceId &&
            messageId &&
            notification === undefined
        ) {
            getNotificationSubscription(
                messageId,
                liveSpecId,
                preferenceId
            ).then(
                (response) => {
                    console.log('init switch success', response);

                    setNotification(response.data);
                },
                () => {
                    console.log('init switch error');
                    setNotification(null);
                }
            );
        }
    }, [liveSpecId, messageId, preferenceId, notification, setNotification]);

    const updateEvaluationInterval = useCallback(
        (_event: React.SyntheticEvent, value: string) => {
            if (notification) {
                if (value === 'none') {
                    deleteNotification(notification.id).then(
                        () => {
                            console.log('deleted notification');
                        },
                        () => {
                            console.log('failed to delete notification');
                        }
                    );
                } else {
                    updateNotificationInterval(notification.id, value).then(
                        () => {
                            console.log('updated notification');
                        },
                        () => {
                            console.log('failed to update notification');
                        }
                    );
                }
            } else if (messageId && preferenceId && liveSpecId) {
                createNotification(
                    preferenceId,
                    messageId,
                    value,
                    liveSpecId
                ).then(
                    (response) => {
                        console.log('created notification', response);
                    },
                    () => {
                        console.log('failed to create notification');
                    }
                );
            }
        },
        [liveSpecId, messageId, notification?.id, preferenceId, setNotification]
    );

    const options = useMemo(
        () => ({
            'none': intl.formatMessage({
                id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.unsetOption',
            }),
            '01:00:00': intl.formatMessage(intervalOptionId, { interval: 1 }),
            '02:00:00': intl.formatMessage(intervalOptionId, { interval: 2 }),
            '04:00:00': intl.formatMessage(intervalOptionId, { interval: 4 }),
            '08:00:00': intl.formatMessage(intervalOptionId, { interval: 8 }),
            '12:00:00': intl.formatMessage(intervalOptionId, { interval: 12 }),
            '24:00:00': intl.formatMessage(intervalOptionId, { interval: 24 }),
        }),
        [intl]
    );

    return (
        <Stack
            spacing={2}
            direction="row"
            sx={{
                py: 2,
                alignItems: 'end',
                justifyContent: 'space-between',
                borderBottom: hideBorder
                    ? 'none'
                    : (theme) => defaultOutline[theme.palette.mode],
            }}
        >
            {notification === undefined ? (
                <>
                    <Skeleton sx={{ flexGrow: 1 }} />

                    <Skeleton width={150} />
                </>
            ) : (
                <>
                    <Stack spacing={1}>
                        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                            <FormattedMessage id="details.settings.notifications.dataProcessing.header" />
                        </Typography>

                        <Typography>
                            <FormattedMessage id="details.settings.notifications.dataProcessing.noDataProcessedInInterval.message" />
                        </Typography>
                    </Stack>

                    <Autocomplete
                        defaultValue={
                            notification?.evaluation_interval &&
                            Object.hasOwn(
                                options,
                                notification.evaluation_interval
                            )
                                ? options[notification.evaluation_interval]
                                : options[0]
                        }
                        disableClearable
                        disabled={
                            !preferenceId ||
                            !liveSpecId ||
                            !messageId ||
                            !notification
                        }
                        onChange={updateEvaluationInterval}
                        options={Object.values(options)}
                        sx={{ width: 150 }}
                        renderInput={({
                            InputProps,
                            ...params
                        }: AutocompleteRenderInputParams) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...InputProps,
                                    sx: { borderRadius: 3 },
                                }}
                                label={intl.formatMessage({
                                    id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.label',
                                })}
                                size="small"
                                variant="outlined"
                            />
                        )}
                    />
                </>
            )}
        </Stack>
    );
}

export default DataProcessingSetting;