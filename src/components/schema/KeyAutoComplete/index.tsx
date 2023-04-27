import { arrayMove } from '@dnd-kit/sortable';
import { Autocomplete, Grid, Skeleton, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { useEntityType } from 'context/EntityContext';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ReadOnly from './ReadOnly';
import SortableTags from './SortableTags';

interface Props {
    value: any;
    inferredSchema: any;
    disabled?: boolean;
    onChange?: (event: any, newValue: string[], reason: string) => void;
}

const typesAllowedAsKeys = ['string', 'integer', 'boolean'];

function KeyAutoComplete({ disabled, inferredSchema, onChange, value }: Props) {
    const [keys, setKeys] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

    const entityType = useEntityType();
    const editKeyAllowed = entityType === 'capture';

    useEffect(() => {
        let inferredProperties;
        if (disabled) {
            inferredProperties = [];
        } else {
            // Infer the properties with WebFlow and then filter/map them for the dropdown
            inferredProperties = inferredSchema
                ?.filter((inferredProperty: any) => {
                    // Check if this field:
                    //  must exist
                    //  has a single known type
                    //  has an allowed type
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
                    // We only care about the pointer
                    (filteredInferredProperty: any) =>
                        filteredInferredProperty.pointer
                );
        }

        setKeys(inferredProperties);
    }, [inferredSchema, disabled]);

    const renderTags = useCallback(
        (tagValues, getTagProps, ownerState) => {
            console.log('rendering tags', tagValues);
            return (
                <SortableTags
                    values={tagValues}
                    getTagProps={getTagProps}
                    ownerState={ownerState}
                    onOrderChange={(activeId, overId) => {
                        if (onChange) {
                            const oldIndex = value.indexOf(activeId);
                            const newIndex = value.indexOf(overId);

                            const updatedArray = arrayMove<string>(
                                value,
                                oldIndex,
                                newIndex
                            );
                            onChange(null, updatedArray, 'orderChange');
                        }
                    }}
                />
            );
        },
        [onChange, value]
    );

    const changeHandler = editKeyAllowed ? onChange : undefined;
    const disableInput = editKeyAllowed ? disabled : false;

    if (!disabled && keys.length === 0) {
        return <Skeleton />;
    }

    if (!editKeyAllowed || disableInput) {
        return <ReadOnly value={value} />;
    }

    console.log('autocomplete value = ', value);

    return (
        <Grid item xs={12}>
            <Autocomplete
                {...autoCompleteDefaults_Virtual_Multiple}
                value={value}
                onChange={changeHandler}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                options={keys}
                readOnly={disableInput}
                renderTags={renderTags}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            variant="standard"
                            disabled={disableInput}
                            label={<FormattedMessage id="data.key.label" />}
                            helperText={
                                <FormattedMessage id="data.key.helper" />
                            }
                        />
                    );
                }}
            />
        </Grid>
    );
}

export default KeyAutoComplete;
