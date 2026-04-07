import type { AutocompleteRenderInputParams } from '@mui/material';
import type { AlertTypeSelectorProps } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import {
    Autocomplete,
    FormControl,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import SelectableAutocompleteOption from 'src/components/shared/Dialog/SelectableAutocompleteOption';
import { diminishedTextColor } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import { basicSort_string, sortByAlertType } from 'src/utils/misc-utils';

const AlertTypeSelector = ({ options }: AlertTypeSelectorProps) => {
    const intl = useIntl();
    const theme = useTheme();

    const serverError = useAlertSubscriptionsStore(
        (state) => state.initializationError
    );
    const alertTypes = useAlertSubscriptionsStore(
        (state) => state.subscription.alertTypes
    );
    const setAlertTypes = useAlertSubscriptionsStore(
        (state) => state.setAlertTypes
    );

    const values: AlertTypeInfo[] = useMemo(
        () => options.filter(({ alertType }) => alertTypes.includes(alertType)),
        [options, alertTypes]
    );

    return (
        <FormControl fullWidth>
            <Autocomplete
                disableCloseOnSelect
                disabled={Boolean(serverError)}
                getOptionLabel={({ alertType }) => alertType}
                isOptionEqualToValue={(option, value) =>
                    option.alertType === value.alertType
                }
                multiple
                onChange={(_event, values) => {
                    setAlertTypes(values);
                }}
                options={options.sort((first, second) =>
                    basicSort_string(
                        first.displayName,
                        second.displayName,
                        'asc'
                    )
                )}
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
                            id: 'entityTable.data.alertTypes',
                        })}
                        size="small"
                        variant="outlined"
                    />
                )}
                renderOption={(renderOptionProps, option, state) => {
                    const { description, displayName, isSystem } = option;

                    return isSystem ? null : (
                        <SelectableAutocompleteOption
                            Content={
                                <Stack>
                                    <Typography
                                        style={{
                                            fontWeight: 500,
                                            marginBottom: 4,
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {displayName}
                                    </Typography>

                                    {description ? (
                                        <Typography
                                            sx={{
                                                color: diminishedTextColor[
                                                    theme.palette.mode
                                                ],
                                            }}
                                        >
                                            {description}
                                        </Typography>
                                    ) : null}
                                </Stack>
                            }
                            renderOptionProps={renderOptionProps}
                            state={state}
                        />
                    );
                }}
                renderTags={(values, getTagProps) => {
                    return values
                        .sort((first, second) =>
                            sortByAlertType(
                                {
                                    isSystemAlert: first.isSystem,
                                    value: first.displayName,
                                },
                                {
                                    isSystemAlert: second.isSystem,
                                    value: second.displayName,
                                },
                                'asc'
                            )
                        )
                        .map(({ alertType, displayName, isSystem }, index) => {
                            const { onDelete, ...tagProps } = getTagProps({
                                index,
                            });

                            return (
                                <OutlinedChip
                                    {...tagProps}
                                    diminishedText={isSystem}
                                    key={`alert_type-tag-${alertType}-${index}`}
                                    label={displayName}
                                    onDelete={isSystem ? undefined : onDelete}
                                    size="small"
                                    variant="outlined"
                                />
                            );
                        });
                }}
                value={values}
            />
        </FormControl>
    );
};

export default AlertTypeSelector;
