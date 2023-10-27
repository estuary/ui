import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Skeleton,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {
    DataProcessingNotificationQuery,
    createDataProcessingNotification,
    deleteDataProcessingNotification,
    updateDataProcessingNotificationInterval,
} from 'api/alerts';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import { ErrorDetails } from 'components/shared/Error/types';
import { defaultOutline } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useInitializeTaskNotification from 'hooks/useInitializeTaskNotification';
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    errored: boolean;
    loading: boolean;
    setUpdateSettingsError: Dispatch<SetStateAction<ErrorDetails>>;
    hideBorder?: boolean;
}

const intervalOptionId = {
    id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.intervalOptions',
};

const defaultUpdateSettingsError = {
    message:
        'details.settings.notifications.alert.updateSettingsFailed.message',
};

function DataProcessingSetting({
    errored,
    loading,
    setUpdateSettingsError,
    hideBorder,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const liveSpecId = useEditorStore_id({ localScope: true });

    const [notification, setNotification] = useState<
        DataProcessingNotificationQuery | null | undefined
    >(undefined);

    // const [errorSeverity, setErrorSeverity] = useState<AlertColor | null>(null);

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
                            if (response.data && response.data.length > 0) {
                                setNotification(null);
                                setUpdateSettingsError(null);
                            } else {
                                setUpdateSettingsError(
                                    response.error ?? defaultUpdateSettingsError
                                );
                            }
                        },
                        (error) => {
                            setUpdateSettingsError(error);
                        }
                    );
                } else {
                    updateDataProcessingNotificationInterval(
                        notification.live_spec_id,
                        value
                    ).then(
                        (response) => {
                            if (response.data && response.data.length > 0) {
                                setNotification(response.data[0]);
                                setUpdateSettingsError(null);
                            } else {
                                setUpdateSettingsError(
                                    response.error ?? defaultUpdateSettingsError
                                );
                            }
                        },
                        (error) => {
                            setUpdateSettingsError(error);
                        }
                    );
                }
            } else if (liveSpecId) {
                createDataProcessingNotification(liveSpecId, value).then(
                    (response) => {
                        if (response.data && response.data.length > 0) {
                            setNotification(response.data[0]);
                            setUpdateSettingsError(null);
                        } else {
                            setUpdateSettingsError(
                                response.error ?? defaultUpdateSettingsError
                            );
                        }
                    },
                    (error) => {
                        setUpdateSettingsError(error);
                    }
                );
            }
        },
        [
            liveSpecId,
            notification,
            options.none,
            setNotification,
            setUpdateSettingsError,
        ]
    );

    const { getNotifications } = useInitializeTaskNotification(catalogName);

    useEffect(() => {
        if (liveSpecId && notification === undefined) {
            getNotifications(liveSpecId).then(
                (response) => {
                    console.log('init switch success', response);

                    setNotification(response.data);
                    // setErrorSeverity(null);
                },
                () => {
                    console.log('init switch error');
                    // setErrorSeverity('error');
                    setNotification(null);
                }
            );
        }
    }, [liveSpecId, notification, getNotifications, setNotification]);

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
                    : defaultOutline[theme.palette.mode],
            }}
        >
            {loading || notification === undefined ? (
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
                                error={errored}
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
