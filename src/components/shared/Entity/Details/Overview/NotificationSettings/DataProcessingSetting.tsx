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
    DataProcessingAlertQuery,
    createDataProcessingNotification,
    deleteDataProcessingNotification,
    updateDataProcessingNotificationInterval,
} from 'api/alerts';
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

const intervalOptionIds = {
    hour: {
        id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.intervalOptions.hour',
    },
    day: {
        id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.intervalOptions.day',
    },
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

    const [notification, setNotification] = useState<
        DataProcessingAlertQuery | null | undefined
    >(undefined);

    // const [errorSeverity, setErrorSeverity] = useState<AlertColor | null>(null);

    const options: { [interval: string]: string } = useMemo(
        () => ({
            '2 days': intl.formatMessage(intervalOptionIds.day, {
                interval: 2,
            }),
            '24:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 24,
            }),
            '12:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 12,
            }),
            '08:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 8,
            }),
            '04:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 4,
            }),
            '02:00:00': intl.formatMessage(intervalOptionIds.hour, {
                interval: 2,
            }),
            'none': intl.formatMessage({
                id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.unsetOption',
            }),
        }),
        [intl]
    );

    const updateEvaluationInterval = useCallback(
        (_event: React.SyntheticEvent, value: string) => {
            if (notification) {
                if (value === 'none') {
                    deleteDataProcessingNotification(
                        notification.catalog_name
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
                        notification.catalog_name,
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
            } else if (catalogName) {
                createDataProcessingNotification(catalogName, value).then(
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
            catalogName,
            notification,
            options.none,
            setNotification,
            setUpdateSettingsError,
        ]
    );

    const { getNotifications } = useInitializeTaskNotification(catalogName);

    useEffect(() => {
        if (catalogName && notification === undefined) {
            getNotifications().then(
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
    }, [catalogName, notification, getNotifications, setNotification]);

    return (
        <Stack
            spacing={2}
            direction="row"
            sx={{
                pb: 2,
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
                        disabled={!catalogName}
                        disableClearable
                        getOptionLabel={(interval) => options[interval]}
                        onChange={updateEvaluationInterval}
                        options={Object.keys(options)}
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
                        sx={{ width: 150 }}
                        value={notification?.evaluation_interval ?? 'none'}
                    />
                </>
            )}
        </Stack>
    );
}

export default DataProcessingSetting;
