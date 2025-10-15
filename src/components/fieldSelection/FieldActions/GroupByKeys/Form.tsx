import type { GroupByKeysFormProps } from 'src/components/fieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';

import { useMemo } from 'react';

import {
    Autocomplete,
    Box,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import { arrayMove } from '@dnd-kit/sortable';
import { Check } from 'iconoir-react';
import { useIntl } from 'react-intl';

import SortableTags from 'src/components/schema/KeyAutoComplete/SortableTags';
import { diminishedTextColor, truncateTextSx } from 'src/context/Theme';
import { isValidCollectionKey } from 'src/utils/schema-utils';

const GroupByKeysForm = ({
    localValues,
    options,
    setLocalValues,
}: GroupByKeysFormProps) => {
    const intl = useIntl();
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const fieldWidth = useMemo(() => (belowMd ? 400 : 700), [belowMd]);

    return (
        <Autocomplete
            disableCloseOnSelect
            filterOptions={(selections) =>
                selections.filter(({ projection }) =>
                    isValidCollectionKey(projection?.inference)
                )
            }
            getOptionLabel={({ field }) => field}
            isOptionEqualToValue={(option, value) =>
                option.field === value.field
            }
            multiple
            onChange={(_event, values) => {
                setLocalValues(values);
            }}
            options={options}
            renderInput={(params) => {
                return (
                    <TextField
                        {...params}
                        label={intl.formatMessage({
                            id: 'fieldSelection.groupBy.label.field',
                        })}
                        variant="standard"
                    />
                );
            }}
            renderOption={(renderOptionProps, option, state) => {
                const { field, projection } = option;
                const { key, ...optionProps } = renderOptionProps;

                const fieldTypes: string[] =
                    projection?.inference?.types.map((fieldType: string) => {
                        if (
                            fieldType === 'string' &&
                            projection.inference?.string?.format
                        ) {
                            return `${fieldType}: ${projection.inference.string.format}`;
                        }

                        return fieldType;
                    }) ?? [];

                return (
                    <Box
                        {...optionProps}
                        component="li"
                        key={key}
                        style={{
                            alignItems: 'flex-start',
                            display: 'flex',
                            paddingLeft: 10,
                            paddingRight: 8,
                        }}
                    >
                        {state.selected ? (
                            <Check
                                style={{
                                    color: theme.palette.primary.main,
                                    fontSize: 12,
                                    marginRight: 4,
                                    marginTop: 2,
                                }}
                            />
                        ) : (
                            <Box style={{ width: 18, marginRight: 4 }} />
                        )}

                        <Stack>
                            <Stack
                                direction="row"
                                style={{ alignItems: 'center' }}
                            >
                                <Typography
                                    style={{ fontWeight: 500, marginBottom: 4 }}
                                >
                                    {field}
                                </Typography>

                                {fieldTypes.length > 0 ? (
                                    <Typography
                                        component="span"
                                        style={{
                                            fontFamily: 'monospace',
                                            marginLeft: 8,
                                        }}
                                        variant="body2"
                                    >
                                        [{fieldTypes.join(', ')}]
                                    </Typography>
                                ) : null}
                            </Stack>

                            {projection?.inference?.description ? (
                                <Typography
                                    sx={{
                                        ...truncateTextSx,
                                        color: diminishedTextColor[
                                            theme.palette.mode
                                        ],
                                        width: fieldWidth - 75,
                                    }}
                                >
                                    {projection.inference.description}
                                </Typography>
                            ) : null}
                        </Stack>
                    </Box>
                );
            }}
            renderTags={(tagValues, getTagProps, ownerState) => {
                return (
                    <SortableTags
                        getTagProps={getTagProps}
                        onOrderChange={async (activeId, overId) => {
                            const selectedFields = localValues.map(
                                ({ field }) => field
                            );

                            const updatedArray = arrayMove<FieldSelection>(
                                localValues,
                                selectedFields.indexOf(activeId),
                                selectedFields.indexOf(overId)
                            );

                            setLocalValues(updatedArray);
                        }}
                        ownerState={ownerState}
                        values={tagValues.map(({ field }) => field)}
                    />
                );
            }}
            style={{ width: fieldWidth }}
            value={localValues}
        />
    );
};

export default GroupByKeysForm;
