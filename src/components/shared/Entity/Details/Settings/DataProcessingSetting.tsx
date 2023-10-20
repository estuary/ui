import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    DataProcessingNotificationQuery,
    createDataProcessingNotification,
    deleteDataProcessingNotification,
    updateDataProcessingNotificationInterval,
} from 'api/alerts';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import { defaultOutline } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useInitializeTaskNotification from 'hooks/useInitializeTaskNotification';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    hideBorder?: boolean;
}

const intervalOptionId = {
    id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.intervalOptions',
};

function DataProcessingSetting({ hideBorder }: Props) {
    const intl = useIntl();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const liveSpecId = useEditorStore_id({ localScope: true });

    const [notification, setNotification] = useState<
        DataProcessingNotificationQuery | null | undefined
    >(undefined);

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

    const updateEvaluationInterval = useCallback(
        (_event: React.SyntheticEvent, value: string) => {
            if (notification) {
                if (value === options.none) {
                    deleteDataProcessingNotification(
                        notification.live_spec_id
                    ).then(
                        (response) => {
                            console.log('deleted notification');

                            if (response.data && response.data.length > 0) {
                                setNotification(null);
                            }
                        },
                        () => {
                            console.log('failed to delete notification');
                        }
                    );
                } else {
                    updateDataProcessingNotificationInterval(
                        notification.live_spec_id,
                        value
                    ).then(
                        (response) => {
                            console.log('updated notification');

                            if (response.data && response.data.length > 0) {
                                setNotification(response.data[0]);
                            }
                        },
                        () => {
                            console.log('failed to update notification');
                        }
                    );
                }
            } else if (liveSpecId) {
                createDataProcessingNotification(liveSpecId, value).then(
                    (response) => {
                        console.log('created notification', response);

                        if (response.data && response.data.length > 0) {
                            setNotification(response.data[0]);
                        }
                    },
                    () => {
                        console.log('failed to create notification');
                    }
                );
            }
        },
        [liveSpecId, notification, setNotification]
    );

    const { getNotificationSubscription } =
        useInitializeTaskNotification(catalogName);

    useEffect(() => {
        if (liveSpecId && notification === undefined) {
            getNotificationSubscription(liveSpecId).then(
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
    }, [liveSpecId, notification, setNotification]);

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
                        value={
                            notification?.evaluation_interval &&
                            Object.hasOwn(
                                options,
                                notification.evaluation_interval
                            )
                                ? options[notification.evaluation_interval]
                                : options.none
                        }
                        disableClearable
                        disabled={!liveSpecId}
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
