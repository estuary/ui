import type { AutocompleteRenderInputParams } from '@mui/material';

import {
    Autocomplete,
    FormControl,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { useIntl } from 'react-intl';

import SelectableAutocompleteOption from 'src/components/shared/Dialog/SelectableAutocompleteOption';
import { diminishedTextColor } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import { UNDERSCORE_RE } from 'src/validation';

const AlertTypeSelector = () => {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <FormControl fullWidth>
            <Autocomplete
                disableCloseOnSelect
                getOptionLabel={({ id }) => id}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                multiple
                options={[
                    {
                        id: 'free_trial',
                        description:
                            'This is a placeholder that is absolutely ridiculously long for no reason other than to wrap.',
                    },
                    {
                        id: 'free_trial_ending',
                        description: 'This is a placeholder',
                    },
                    { id: 'free_trial_stalled' },
                    {
                        id: 'missing_payment_method',
                        description: 'This is a placeholder',
                    },
                    { id: 'data_movement_stalled' },
                ]}
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
                    const { description, id } = option;
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
                                        {id.replace(UNDERSCORE_RE, ' ')}
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
                    return values.map(({ id }, index) => {
                        const tagProps = getTagProps({ index });

                        return (
                            <OutlinedChip
                                {...tagProps}
                                key={`alert_type-tag-${id}-${index}`}
                                label={id.replace(UNDERSCORE_RE, ' ')}
                                size="small"
                                variant="outlined"
                            />
                        );
                    });
                }}
            />
        </FormControl>
    );
};

export default AlertTypeSelector;
