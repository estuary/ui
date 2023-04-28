import { arrayMove } from '@dnd-kit/sortable';
import { Autocomplete, Grid, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { useEntityType } from 'context/EntityContext';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ReadOnly from './ReadOnly';
import SortableTags from './SortableTags';

interface Props {
    value: any;
    inferSchemaResponse: any;
    disabled?: boolean;
    onChange?: (
        event: any,
        newValue: string[],
        reason: string
    ) => PromiseLike<any>;
}

const typesAllowedAsKeys = ['string', 'integer', 'boolean'];

function KeyAutoComplete({
    disabled,
    inferSchemaResponse,
    onChange,
    value,
}: Props) {
    // We want a local copy so that the display is updated right away when the user
    //  is done dragging. Otherwise, the item being dragged kind flies around when
    //  put in a new location
    const [localCopyValue, setLocalCopyValue] = useState<string[]>([]);
    const [keys, setKeys] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

    // We only want to all edit during Capture create/edit.
    const entityType = useEntityType();
    const editKeyAllowed = entityType === 'capture';

    // Make sure we keep our local copy up to date
    useEffect(() => {
        setLocalCopyValue(value);
    }, [value]);

    // Run through the inferSchemaResponse to filter out fields
    //  that cannot be keys and then populate the list of possible
    //  keys.
    useEffect(() => {
        let inferredProperties;
        if (disabled) {
            inferredProperties = [];
        } else {
            // Infer the properties with WebFlow and then filter/map them for the dropdown
            //  We will check if this field:
            //      must exist
            //      has a single known type
            //      has an allowed type
            inferredProperties = inferSchemaResponse
                ?.filter((inferredProperty: any) => {
                    const interrefPropertyTypes = inferredProperty.types;
                    return (
                        inferredProperty.exists === 'must' &&
                        interrefPropertyTypes.length === 1 &&
                        typesAllowedAsKeys.some((key) =>
                            interrefPropertyTypes.includes(key)
                        )
                    );
                })
                .map(
                    // We only care about the pointer string at this point
                    (filteredInferredProperty: any) =>
                        filteredInferredProperty.pointer
                );
        }

        setKeys(inferredProperties);
    }, [inferSchemaResponse, disabled]);

    // Store off variables for when this should be in read only mode
    const changeHandler = editKeyAllowed ? onChange : undefined;
    const disableInput = editKeyAllowed ? disabled : false;

    // TODO (collection editor) this means nothing shows when you edit the schema and there are not valid keys
    // Loading state
    if (!disabled && keys.length === 0) {
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
                inputValue={inputValue}
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
                            disabled={disableInput}
                            helperText={
                                <FormattedMessage id="schemaEditor.key.helper" />
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
