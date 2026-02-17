import type { AutocompleteRenderInputParams } from '@mui/material';
import type { AlertTypeSelectorProps } from 'src/components/admin/Settings/PrefixAlerts/types';

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
import { hasOwnProperty } from 'src/utils/misc-utils';
import { UNDERSCORE_RE } from 'src/validation';

const AlertTypeSelector = ({ options }: AlertTypeSelectorProps) => {
    const intl = useIntl();
    const theme = useTheme();

    const alertTypes = useAlertSubscriptionsStore((state) => {
        const alertNames =
            state.prefix.length > 0 &&
            state.subscriptions &&
            hasOwnProperty(state.subscriptions, state.prefix)
                ? state.subscriptions[state.prefix].alertTypes
                : [];

        return options.filter(({ name }) => alertNames.includes(name));
    });
    const setAlertTypes = useAlertSubscriptionsStore(
        (state) => state.setAlertTypes
    );

    return (
        <FormControl fullWidth>
            <Autocomplete
                disableCloseOnSelect
                getOptionLabel={({ name }) => name}
                isOptionEqualToValue={(option, value) =>
                    option.name === value.name
                }
                multiple
                onChange={(_event, values) => {
                    setAlertTypes(values);
                }}
                options={options}
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
                        required
                        size="small"
                        variant="outlined"
                    />
                )}
                renderOption={(renderOptionProps, option, state) => {
                    const { description, name } = option;
                    return (
                        <SelectableAutocompleteOption
                            Content={
                                <Stack>
                                    <Typography
                                        style={{
                                            fontWeight: 500,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {name.replace(UNDERSCORE_RE, ' ')}
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
                    return values.map(({ name }, index) => {
                        const tagProps = getTagProps({ index });

                        return (
                            <OutlinedChip
                                {...tagProps}
                                key={`alert_type-tag-${name}-${index}`}
                                label={name.replace(UNDERSCORE_RE, ' ')}
                                size="small"
                                variant="outlined"
                            />
                        );
                    });
                }}
                value={alertTypes}
            />
        </FormControl>
    );
};

export default AlertTypeSelector;
