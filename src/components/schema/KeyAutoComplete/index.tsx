import { arrayMove } from '@dnd-kit/sortable';
import { Autocomplete, Grid, TextField } from '@mui/material';
import {
    useBindingsEditorStore_inferSchemaResponseEmpty,
    useBindingsEditorStore_inferSchemaResponse_Keys,
} from 'components/editor/Bindings/Store/hooks';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { useEntityType } from 'context/EntityContext';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import ReadOnly from './ReadOnly';
import SortableTags from './SortableTags';

interface Props {
    value: any;
    disabled?: boolean;
    onChange?: (
        event: any,
        newValue: string[],
        reason: string
    ) => PromiseLike<any>;
}

function KeyAutoComplete({ disabled, onChange, value }: Props) {
    // We want a local copy so that the display is updated right away when the user
    //  is done dragging. Otherwise, the item being dragged kind flies around when
    //  put in a new location
    const [localCopyValue, setLocalCopyValue] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

    // We only want to all edit during Capture create/edit.
    const entityType = useEntityType();
    const editKeyAllowed = entityType === 'capture';

    // Need the response so we know the options
    const inferSchemaResponseEmpty =
        useBindingsEditorStore_inferSchemaResponseEmpty();
    const keys = useBindingsEditorStore_inferSchemaResponse_Keys();

    // Make sure we keep our local copy up to date
    useEffect(() => {
        setLocalCopyValue(value);
    }, [value]);

    // Store off variables for when this should be in read only mode
    const noUsableKeys = !hasLength(keys);
    const changeHandler = editKeyAllowed ? onChange : undefined;
    const disableInput = editKeyAllowed ? disabled : false;
    const showEditErrorState = inferSchemaResponseEmpty || noUsableKeys;

    console.log('>>>>>>>>LKJ', {
        noUsableKeys,
        keys,
        showEditErrorState,
        inferSchemaResponseEmpty,
    });

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
                disabled={inferSchemaResponseEmpty}
                inputValue={inputValue}
                isOptionEqualToValue={(option, tagValue) => {
                    return showEditErrorState ? false : option === tagValue;
                }}
                onChange={changeHandler}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                options={keys}
                readOnly={disableInput}
                value={localCopyValue}
                renderTags={(tagValues, getTagProps, ownerState) => {
                    return (
                        <SortableTags
                            validateOptions={!inferSchemaResponseEmpty}
                            values={tagValues}
                            getTagProps={getTagProps}
                            ownerState={ownerState}
                            onOrderChange={async (activeId, overId) => {
                                const oldIndex =
                                    localCopyValue.indexOf(activeId);
                                const newIndex = localCopyValue.indexOf(overId);

                                const updatedArray = arrayMove<string>(
                                    localCopyValue,
                                    oldIndex,
                                    newIndex
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
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            disabled={inferSchemaResponseEmpty || disableInput}
                            error={showEditErrorState}
                            helperText={
                                inferSchemaResponseEmpty ? (
                                    <FormattedMessage id="keyAutoComplete.noOptions.message" />
                                ) : noUsableKeys ? (
                                    <FormattedMessage id="keyAutoComplete.noUsableKeys.message" />
                                ) : (
                                    <FormattedMessage id="schemaEditor.key.helper" />
                                )
                            }
                            label={
                                <FormattedMessage id="schemaEditor.key.label" />
                            }
                            variant="standard"
                        />
                    );
                }}
            />
        </Grid>
    );
}

export default KeyAutoComplete;
