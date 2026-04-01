import type { AutocompleteRenderInputParams } from '@mui/material';
import type { AlertTypeSelectorProps } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertTypeDef } from 'src/types/gql';

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

    const values: AlertTypeDef[] = useMemo(
        () => options.filter(({ alertType }) => alertTypes.includes(alertType)),
        [options, alertTypes]
    );

    return (
        <FormControl fullWidth>
            <Autocomplete
                disableCloseOnSelect
                disabled={Boolean(serverError)}
                getOptionLabel={({ alertType: name }) => name}
                isOptionEqualToValue={(option, value) =>
                    option.alertType === value.alertType
                }
                multiple
                onChange={(_event, values) => {
                    setAlertTypes(values);
                }}
                options={options.filter(({ isSystemAlert }) => !isSystemAlert)}
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
                    const { description, displayName } = option;

                    return (
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
                    return values.map(
                        ({ alertType, displayName, isSystemAlert }, index) => {
                            const { onDelete, ...tagProps } = getTagProps({
                                index,
                            });

                            return (
                                <OutlinedChip
                                    {...tagProps}
                                    diminishedText={isSystemAlert}
                                    key={`alert_type-tag-${alertType}-${index}`}
                                    label={displayName}
                                    onDelete={
                                        isSystemAlert ? undefined : onDelete
                                    }
                                    size="small"
                                    variant="outlined"
                                />
                            );
                        }
                    );
                }}
                value={values}
            />
        </FormControl>
    );
};

export default AlertTypeSelector;
