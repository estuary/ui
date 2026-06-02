import type { AutocompleteRenderInputParams } from '@mui/material';
import type { GlobalSettingProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { Autocomplete, Stack, TextField, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import useSettingIntervalOptions from 'src/components/shared/Entity/Details/Overview/NotificationSettings/useSettingIntervalOptions';
import { translateUnconventionalTimeFormat } from 'src/utils/notification-utils';

const DataMovementSetting = ({
    prefix,
    setting,
}: GlobalSettingProps<{ stalledFor: string }>) => {
    const intl = useIntl();

    const { options } = useSettingIntervalOptions();

    return (
        <Stack spacing={2}>
            <Stack spacing="2px">
                <Typography style={{ fontWeight: 500 }}>
                    {intl.formatMessage({
                        id: 'alerts.alertType.humanReadable.data_movement_stalled',
                    })}
                </Typography>

                <Typography>
                    {intl.formatMessage({
                        id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.message',
                    })}
                </Typography>
            </Stack>

            <Autocomplete
                disabled={!prefix}
                disableClearable
                fullWidth
                getOptionLabel={(interval) => options[interval]}
                onChange={() => {}}
                options={Object.keys(options)}
                renderInput={({
                    InputProps,
                    ...params
                }: AutocompleteRenderInputParams) => (
                    <TextField
                        {...params}
                        label={intl.formatMessage({
                            id: 'details.settings.notifications.dataProcessing.noDataProcessedInInterval.label',
                        })}
                        size="small"
                        variant="outlined"
                        slotProps={{
                            input: {
                                ...InputProps,
                                sx: { borderRadius: 3 },
                            },
                        }}
                    />
                )}
                value={translateUnconventionalTimeFormat(
                    setting?.condition.stalledFor
                )}
            />
        </Stack>
    );
};

export default DataMovementSetting;
