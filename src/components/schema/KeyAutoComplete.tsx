import { Autocomplete, Grid, Skeleton, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

type OnChange = typeof autoCompleteDefaults_Virtual_Multiple['onChange'];

interface Props {
    value: any;
    inferredSchema: any;
    onChange?: OnChange;
}

const typesAllowedAsKeys = ['string', 'integer', 'boolean'];

function KeyAutoComplete({ inferredSchema, value, onChange }: Props) {
    const defaultValue = useRef(value);
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        // Infer the properties with WebFlow and then filter/map them for the dropdown
        const inferredProperties = inferredSchema
            ?.filter((inferredProperty: any) => {
                const interrefPropertyTypes = inferredProperty.types;
                // If there is a blank pointer it cannot be used
                if (!hasLength(inferredProperty.pointer)) {
                    return false;
                }

                // Check if this field:
                //  must exist
                //  has a single known type
                //  has an allowed type
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
        setKeys(inferredProperties);
    }, [inferredSchema]);

    if (keys.length === 0) {
        return <Skeleton />;
    }

    // TODO (collection editor) decide if we want to make a unique UI
    //  so the read only version is more than just a "read only" autocomplete
    // if (!onChange) {
    //         return (
    //             <Grid item xs={12}>
    //                 <Stack
    //                     direction="row"
    //                     sx={{
    //                         alignItems: 'center',
    //                         alignContent: 'center',
    //                     }}
    //                 >
    //                     <Typography variant="subtitle1" component="span">
    //                         <FormattedMessage id="data.key.label" />
    //                     </Typography>

    //                     <List>
    //                         {keys.map((key) => {
    //                             let icon;
    //                             return (
    //                                 <ListItem key={`read-only-key-${keys}`}>
    //                                     <Chip icon={icon} label={key} />
    //                                 </ListItem>
    //                             );
    //                         })}
    //                     </List>
    //                 </Stack>
    //                 <Typography variant="subtitle1" component="span">
    //                     <FormattedMessage id="data.key.helper" />
    //                 </Typography>
    //             </Grid>
    //         );
    //     }

    const disabled = !onChange;

    return (
        <Grid item xs={12}>
            <Autocomplete
                {...autoCompleteDefaults_Virtual_Multiple}
                onChange={onChange}
                readOnly={disabled}
                defaultValue={defaultValue.current}
                options={keys}
                renderInput={(params) => {
                    params.InputProps.endAdornment = disabled
                        ? undefined
                        : params.InputProps.endAdornment;

                    return (
                        <TextField
                            {...params}
                            variant="standard"
                            disabled={disabled}
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
