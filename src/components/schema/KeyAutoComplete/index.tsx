import { Autocomplete, Grid, Skeleton, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { useEntityType } from 'context/EntityContext';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { OnChange } from '../types';
import ReadOnly from './ReadOnly';
import Tag from './Tag';

interface Props {
    value: any;
    inferredSchema: any;
    disabled?: boolean;
    onChange?: OnChange;
}

const typesAllowedAsKeys = ['string', 'integer', 'boolean'];

function KeyAutoComplete({ disabled, inferredSchema, onChange, value }: Props) {
    const [defaultValue] = useState<string[]>(value);
    const [keys, setKeys] = useState<string[]>([]);

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

    const changeHandler = editKeyAllowed ? onChange : undefined;
    const disableInput = editKeyAllowed ? disabled : false;

    if (!disabled && keys.length === 0) {
        return <Skeleton />;
    }

    if (!editKeyAllowed || disableInput) {
        return <ReadOnly value={value} />;
    }

    return (
        <Grid item xs={12}>
            <Autocomplete
                {...autoCompleteDefaults_Virtual_Multiple}
                onChange={changeHandler}
                readOnly={disableInput}
                defaultValue={defaultValue}
                options={keys}
                renderTags={(tagValues, getTagProps, ownerState) => {
                    return (
                        <Tag
                            values={tagValues}
                            getTagProps={getTagProps}
                            ownerState={ownerState}
                            onOrderChange={(newValue) => {
                                console.log('Order changed', newValue);
                            }}
                        />
                    );
                }}
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
