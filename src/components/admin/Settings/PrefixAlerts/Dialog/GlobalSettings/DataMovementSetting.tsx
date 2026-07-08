import type { AutocompleteRenderInputParams } from '@mui/material';
import type { GlobalSettingProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import React from 'react';

import { Autocomplete, Stack, TextField, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import useSettingIntervalOptions from 'src/components/shared/Entity/Details/Overview/NotificationSettings/useSettingIntervalOptions';
import {
    fromUnconventionalTimeFormat,
    toUnconventionalTimeFormat,
} from 'src/utils/notification-utils';

const DataMovementSetting = ({
    config,
    prefix,
    targetSetting,
}: GlobalSettingProps<{ stalledFor: string }>) => {
    const intl = useIntl();

    const { options } = useSettingIntervalOptions();

    const setGlobalPrefixSettings = useAlertSubscriptionsStore(
        (state) => state.setGlobalPrefixSettings
    );

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
                onChange={(_event: React.SyntheticEvent, value: string) => {
                    const formattedValue = toUnconventionalTimeFormat(value);

                    setGlobalPrefixSettings(
                        formattedValue !== 'none'
                            ? {
                                  [targetSetting]: {
                                      condition: {
                                          stalledFor: formattedValue,
                                      },
                                  },
                              }
                            : {},
                        targetSetting
                    );
                }}
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
                value={fromUnconventionalTimeFormat(
                    config?.condition?.stalledFor
                )}
            />
        </Stack>
    );
};

export default DataMovementSetting;
