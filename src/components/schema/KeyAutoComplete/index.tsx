import type { ReactNode } from 'react';
import type { KeyAutoCompleteProps } from 'src/components/schema/KeyAutoComplete/types';
import type { BuiltProjection_ValidKey } from 'src/types/schemaModels';

import { useEffect, useMemo, useState } from 'react';

import {
    Autocomplete,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { arrayMove } from '@dnd-kit/sortable';
import { filter, orderBy } from 'lodash';
import { useIntl } from 'react-intl';

import {
    useBindingsEditorStore_skimProjectionResponse,
    useBindingsEditorStore_skimProjectionResponse_Keys,
    useBindingsEditorStore_skimProjectionResponseEmpty,
} from 'src/components/editor/Bindings/Store/hooks';
import BasicOption from 'src/components/schema/KeyAutoComplete/options/Basic';
import ReadOnly from 'src/components/schema/KeyAutoComplete/ReadOnly';
import { isValidKeyOption } from 'src/components/schema/KeyAutoComplete/shared';
import SortableTags from 'src/components/schema/KeyAutoComplete/SortableTags';
import { autoCompleteDefaults_Virtual_Multiple } from 'src/components/shared/AutoComplete/DefaultProps';
import { useEntityType } from 'src/context/EntityContext';
import { truncateTextSx } from 'src/context/Theme';
import { hasLength } from 'src/utils/misc-utils';
import { reduceBuiltProjections } from 'src/utils/schema-utils';

const tallHeight = 71;
const getValue = (option: BuiltProjection_ValidKey) => {
    return option.ptr ?? '';
};

function KeyAutoComplete({ disabled, onChange, value }: KeyAutoCompleteProps) {
    const intl = useIntl();

    // We want a local copy so that the display is updated right away when the user
    //  is done dragging. Otherwise, the item being dragged kind flies around when
    //  put in a new location
    const [localCopyValue, setLocalCopyValue] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

    // We only want to allow edit during capture create/edit and derivation create.
    const entityType = useEntityType();
    const editKeyAllowed =
        entityType === 'capture' || entityType === 'collection';

    // Need the response so we know the options
    const skimProjectionResponseEmpty =
        useBindingsEditorStore_skimProjectionResponseEmpty();
    const skimProjectionResponse =
        useBindingsEditorStore_skimProjectionResponse();
    const skimProjectionResponse_Keys =
        useBindingsEditorStore_skimProjectionResponse_Keys();

    const keys = useMemo(() => {
        const skimProjectionResponses = skimProjectionResponse
            ? Object.values(skimProjectionResponse)
            : [];

        return orderBy(
            filter(
                skimProjectionResponses,
                isValidKeyOption(skimProjectionResponse_Keys)
            ).reduce<BuiltProjection_ValidKey[]>(reduceBuiltProjections, []),
            // Order first by exists so groups do not duplicate in the dropdown
            ['inference.exists', 'inference.ptr'],
            ['desc', 'asc']
        );
    }, [skimProjectionResponse, skimProjectionResponse_Keys]);

    // Make sure we keep our local copy up to date
    useEffect(() => {
        setLocalCopyValue(value);
    }, [value]);

    // TODO (collection editor) move these helper vars into the store
    // Store off variables for when this should be in read only mode
    const noUsableKeys = !hasLength(keys);
    const changeHandler = editKeyAllowed ? onChange : undefined;
    const disableInput = editKeyAllowed ? disabled : false;
    const showEditErrorState = skimProjectionResponseEmpty || noUsableKeys;

    // Loading state and we do not want to stop here if
    // the inferSchemaMissing error is hit because we'll handle
    // that below by showing the error and input in an error state
    if (!showEditErrorState && !disabled && keys.length === 0) {
        return null;
    }

    // For this component we have a custom read only mode instead of displaying
    //  just a disabled input. Mainly because it looked bad sitting next to
    //  a table and being the only "input" on the page.
    if (!editKeyAllowed || disableInput) {
        return <ReadOnly value={value} />;
    }

    return (
        <Grid item xs={12}>
            <Autocomplete
                {...autoCompleteDefaults_Virtual_Multiple}
                disabled={skimProjectionResponseEmpty}
                getOptionLabel={getValue}
                groupBy={(option) => option.inference?.exists ?? ''}
                inputValue={inputValue}
                isOptionEqualToValue={(option, optionValue) => {
                    // MUI has issues with typing options different from values
                    //  see: https://github.com/mui/material-ui/issues/23708
                    // @ts-expect-error value is string[] but options is BuiltProjection_ValidKey[]
                    return option.ptr === optionValue;
                }}
                options={keys}
                readOnly={disableInput}
                // @ts-expect-error value is string[] but options is BuiltProjection_ValidKey[]
                value={localCopyValue}
                onChange={async (event, newValues, reason) => {
                    if (changeHandler) {
                        await changeHandler(
                            event,
                            newValues.map((newValue) => {
                                if (typeof newValue === 'string') {
                                    return newValue;
                                } else {
                                    return getValue(newValue);
                                }
                            }),
                            reason
                        );
                    }
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderGroup={({ key, group, children }) => {
                    const readableGroup = intl.formatMessage({
                        id:
                            group === 'MUST'
                                ? 'keyAutoComplete.keys.group.must'
                                : 'keyAutoComplete.keys.group.may',
                    });

                    return { key, group: readableGroup, children } as ReactNode;
                }}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            disabled={
                                skimProjectionResponseEmpty || disableInput
                            }
                            error={showEditErrorState}
                            helperText={intl.formatMessage({
                                id: skimProjectionResponseEmpty
                                    ? 'keyAutoComplete.noOptions.message'
                                    : noUsableKeys
                                      ? 'keyAutoComplete.noUsableKeys.message'
                                      : 'schemaEditor.key.helper',
                            })}
                            label={intl.formatMessage({
                                id: 'schemaEditor.key.label',
                            })}
                            variant="standard"
                        />
                    );
                }}
                renderOption={(renderOptionProps, option, state) => {
                    const { ptr, inference } = option;

                    // We do this logic here to pass the specific component (Stack with custom prop)
                    //  into the virtualized renderer. That way we can easily read off the custom prop.
                    let RowContent;
                    if (inference?.description) {
                        RowContent = (
                            <Stack
                                component="span"
                                spacing={1}
                                x-react-window-item-height={tallHeight}
                            >
                                <BasicOption
                                    pointer={ptr}
                                    types={inference.types}
                                />
                                <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{
                                        ...truncateTextSx,
                                        pl: 1.5,
                                    }}
                                >
                                    {inference.description}
                                </Typography>
                            </Stack>
                        );
                    } else {
                        RowContent = (
                            <BasicOption
                                pointer={ptr}
                                types={inference.types}
                            />
                        );
                    }

                    return [
                        renderOptionProps,
                        RowContent,
                        state.selected,
                    ] as ReactNode;
                }}
                renderTags={(tagValues, getTagProps, ownerState) => {
                    return (
                        <SortableTags
                            validateOptions={!skimProjectionResponseEmpty}
                            values={tagValues}
                            getTagProps={getTagProps}
                            ownerState={ownerState}
                            onOrderChange={async (activeId, overId) => {
                                const updatedArray = arrayMove<string>(
                                    localCopyValue,
                                    localCopyValue.indexOf(activeId), // old index
                                    localCopyValue.indexOf(overId) //new index
                                );

                                setLocalCopyValue(updatedArray);
                                await changeHandler?.(
                                    null,
                                    updatedArray,
                                    'orderingUpdated'
                                );
                            }}
                        />
                    );
                }}
            />
        </Grid>
    );
}

export default KeyAutoComplete;
