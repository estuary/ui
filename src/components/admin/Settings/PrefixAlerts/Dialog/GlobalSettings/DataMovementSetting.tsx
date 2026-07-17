import type { AutocompleteRenderInputParams } from '@mui/material';
import type { GlobalSettingProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import React, { useMemo } from 'react';

import {
    Autocomplete,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { cloneDeep, set } from 'lodash';
import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import useSettingIntervalOptions from 'src/components/shared/Entity/Details/Overview/NotificationSettings/useSettingIntervalOptions';
import { hasOwnProperty } from 'src/utils/misc-utils';
import {
    fromUnconventionalTimeFormat,
    toUnconventionalTimeFormat,
} from 'src/utils/notification-utils';

const DataMovementSetting = ({
    configs,
    loading,
    prefix,
    targetSetting,
}: GlobalSettingProps) => {
    const intl = useIntl();

    const { options } = useSettingIntervalOptions();

    const setGlobalPrefixSettings = useAlertSubscriptionsStore(
        (state) => state.setGlobalPrefixSettings
    );

    const setting = useMemo(() => {
        const {
            explicit: { effective: explicitEffectiveConfig },
            implicit: { effective: implicitEffectiveConfig },
        } = configs;

        return explicitEffectiveConfig?.[targetSetting] &&
            hasOwnProperty(
                explicitEffectiveConfig?.[targetSetting],
                'condition'
            )
            ? explicitEffectiveConfig[targetSetting]
            : (implicitEffectiveConfig?.[targetSetting] ?? {});
    }, [configs, targetSetting]);

    return (
        <Stack spacing={2}>
            <Stack spacing="2px" style={{ flexGrow: 1 }}>
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

            {loading ? (
                <Skeleton height={38} />
            ) : (
                <Autocomplete
                    disabled={!prefix}
                    disableClearable
                    fullWidth
                    getOptionLabel={(interval) => options[interval]}
                    onChange={(_event: React.SyntheticEvent, value: string) => {
                        const formattedValue =
                            toUnconventionalTimeFormat(value);

                        const clonedSetting = cloneDeep(setting);
                        set(
                            clonedSetting,
                            'condition.stalledFor',
                            formattedValue
                        );

                        setGlobalPrefixSettings(
                            formattedValue !== 'none' &&
                                clonedSetting?.condition
                                ? clonedSetting.condition
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
                        setting?.condition?.stalledFor
                    )}
                />
            )}
        </Stack>
    );
};

export default DataMovementSetting;
