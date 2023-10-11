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
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    headerId: string;
    labelId: string;
    messageName: string;
    liveSpecId: string | null;
    preferenceId: string | null;
    hideBorder?: boolean;
}

const noIntervalOption = 'None';

const options = {
    'none': noIntervalOption,
    '01:00:00': '1 hour',
    '02:00:00': '2 hours',
    '04:00:00': '4 hours',
    '08:00:00': '8 hours',
    '12:00:00': '12 hours',
    '24:00:00': '24 hours',
};

function SwitchSetting({
    headerId,
    labelId,
    liveSpecId,
    preferenceId,
    messageName,
    hideBorder,
}: Props) {
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
                }
            },
            () => {
                console.log('init message error');
            }
        );
    }, [messageName, setMessageId]);

    useEffect(() => {
        if (liveSpecId && preferenceId && messageId) {
            getNotificationSubscription(
                messageId,
                liveSpecId,
                preferenceId
            ).then(
                (response) => {
                    console.log('init switch success', response);
                    console.log('convert', notification?.evaluation_interval);

                    setNotification(response.data);
                },
                () => {
                    console.log('init switch error');
                }
            );
        }
    }, [liveSpecId, messageId, preferenceId, setNotification]);

    const updateEvaluationInterval = useCallback(
        (_event: React.SyntheticEvent, value: string) => {
            console.log('auto val', value);

            if (notification) {
                // Delete notification
                console.log('notification');

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
                            <FormattedMessage id={headerId} />
                        </Typography>

                        <Typography>
                            <FormattedMessage id={labelId} />
                        </Typography>
                    </Stack>

                    <Autocomplete
                        defaultValue={
                            notification?.evaluation_interval
                                ? options[notification.evaluation_interval]
                                : noIntervalOption
                        }
                        disableClearable
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
                                label="Interval"
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

export default SwitchSetting;
