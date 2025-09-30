import type { BaseProps } from 'src/components/fieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';

import { useMemo, useState } from 'react';

import {
    Autocomplete,
    Box,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import { arrayMove } from '@dnd-kit/sortable';
import { Check, Key } from 'iconoir-react';
import { useIntl } from 'react-intl';

import SortableTags from 'src/components/schema/KeyAutoComplete/SortableTags';
import { diminishedTextColor, truncateTextSx } from 'src/context/Theme';

const GroupByKeysForm = ({ selections }: BaseProps) => {
    const intl = useIntl();
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const [localCopyValue, setLocalCopyValue] = useState<FieldSelection[]>(
        selections?.filter(({ groupBy }) => groupBy.implicit) ?? []
    );

    const fieldWidth = useMemo(() => (belowMd ? 400 : 700), [belowMd]);

    return (
        <Autocomplete
            disableCloseOnSelect
            getOptionLabel={({ field }) => field}
            multiple
            onChange={(_event, values) => {
                setLocalCopyValue(values);
            }}
            options={selections ?? []}
            renderInput={(params) => {
                return <TextField {...params} variant="standard" />;
            }}
            renderOption={(renderOptionProps, option, state) => {
                const { field, groupBy, projection } = option;
                const { key, ...optionProps } = renderOptionProps;

                const fieldTypes: string[] = projection?.inference?.types ?? [];

                return (
                    <Box
                        {...optionProps}
                        component="li"
                        key={key}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingLeft: 10,
                            paddingRight: 8,
                        }}
                    >
                        <Stack>
                            <Stack
                                direction="row"
                                style={{ alignItems: 'center' }}
                            >
                                {state.selected ? (
                                    <Check
                                        style={{
                                            color: theme.palette.primary.main,
                                            fontSize: 12,
                                            marginRight: 4,
                                        }}
                                    />
                                ) : null}

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

                        {groupBy.implicit ? (
                            <Tooltip
                                placement="left"
                                title={intl.formatMessage({
                                    id: 'fieldSelection.groupBy.tooltip.implicitKey',
                                })}
                            >
                                <Key
                                    style={{
                                        color: theme.palette.text.primary,
                                    }}
                                />
                            </Tooltip>
                        ) : null}

                        {/* <FieldOutcomeButton
                            bindingUUID={bindingUUID}
                            outcome={outcome}
                        /> */}
                    </Box>
                );
            }}
            renderTags={(tagValues, getTagProps, ownerState) => {
                return (
                    <SortableTags
                        getTagProps={getTagProps}
                        onOrderChange={async (activeId, overId) => {
                            const selectedFields = localCopyValue.map(
                                ({ field }) => field
                            );

                            const oldIndex = selectedFields.indexOf(activeId);
                            const newIndex = selectedFields.indexOf(overId);

                            const updatedArray = arrayMove<FieldSelection>(
                                localCopyValue,
                                oldIndex,
                                newIndex
                            );

                            setLocalCopyValue(updatedArray);
                        }}
                        ownerState={ownerState}
                        values={tagValues.map(({ field }) => field)}
                    />
                );
            }}
            style={{ width: fieldWidth }}
            value={localCopyValue}
        />
    );
};

export default GroupByKeysForm;
