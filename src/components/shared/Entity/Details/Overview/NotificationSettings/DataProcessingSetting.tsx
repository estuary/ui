import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Skeleton,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import {
    createDataProcessingNotification,
    DataProcessingAlertQuery,
    deleteDataProcessingNotification,
    updateDataProcessingNotificationInterval,
} from 'src/api/alerts';
import useSettingIntervalOptions from 'src/components/shared/Entity/Details/Overview/NotificationSettings/useSettingIntervalOptions';
import { ErrorDetails } from 'src/components/shared/Error/types';
import { cardHeaderSx, defaultOutline } from 'src/context/Theme';
import useInitializeTaskNotification from 'src/hooks/notifications/useInitializeTaskNotification';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { CallSupabaseResponse } from 'src/services/supabase';

interface Props {
    errored: boolean;
    loading: boolean;
    setUpdateSettingsError: Dispatch<SetStateAction<ErrorDetails>>;
    hideBorder?: boolean;
}

const defaultUpdateSettingsError = {
    message:
        'details.settings.notifications.alert.updateSettingsFailed.message',
};

const handleSuccess = (
    notification: DataProcessingAlertQuery | null,
    response: CallSupabaseResponse<any>,
    setNotification: Dispatch<
        SetStateAction<DataProcessingAlertQuery | null | undefined>
    >,
    setUpdateSettingsError: Dispatch<SetStateAction<ErrorDetails>>
): void => {
    if (response.data && response.data.length > 0) {
        setNotification(notification);
        setUpdateSettingsError(null);
    } else {
        setUpdateSettingsError(response.error ?? defaultUpdateSettingsError);
    }
};

const handleFailure = (
    error: any,
    setUpdateSettingsError: Dispatch<SetStateAction<ErrorDetails>>
): void => {
    setUpdateSettingsError(error);
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

    const { options } = useSettingIntervalOptions();

    const [notification, setNotification] = useState<
        DataProcessingAlertQuery | null | undefined
    >(undefined);

    const updateEvaluationInterval = useCallback(
        (_event: React.SyntheticEvent, value: string) => {
            if (notification) {
                if (value === 'none') {
                    deleteDataProcessingNotification(
                        notification.catalog_name
                    ).then(
                        (response) =>
                            handleSuccess(
                                null,
                                response,
                                setNotification,
                                setUpdateSettingsError
                            ),
                        (error) => handleFailure(error, setUpdateSettingsError)
                    );
                } else {
                    updateDataProcessingNotificationInterval(
                        notification.catalog_name,
                        value
                    ).then(
                        (response) =>
                            handleSuccess(
                                response.data[0],
                                response,
                                setNotification,
                                setUpdateSettingsError
                            ),
                        (error) => handleFailure(error, setUpdateSettingsError)
                    );
                }
            } else if (catalogName) {
                createDataProcessingNotification(catalogName, value).then(
                    (response) =>
                        handleSuccess(
                            response.data[0],
                            response,
                            setNotification,
                            setUpdateSettingsError
                        ),
                    (error) => handleFailure(error, setUpdateSettingsError)
                );
            }
        },
        [catalogName, notification, setNotification, setUpdateSettingsError]
    );

    const { getNotifications } = useInitializeTaskNotification(catalogName);

    useEffect(() => {
        if (catalogName && notification === undefined) {
            getNotifications().then(
                (response) => {
                    setNotification(response.data);
                },
                () => {
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
                        <Typography sx={cardHeaderSx}>
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
