import {
    Autocomplete,
    Chip,
    Grid,
    IconButton,
    ListItem,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { useEntityType } from 'context/EntityContext';
import { HelpCircle } from 'iconoir-react';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { OnChange } from './types';

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
        return (
            <Grid item xs={12}>
                <Stack
                    direction="row"
                    sx={{
                        alignItems: 'center',
                        alignContent: 'center',
                    }}
                >
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: 'center',
                            alignContent: 'center',
                        }}
                    >
                        <Typography variant="subtitle1" component="div">
                            <FormattedMessage id="data.key.label" />
                        </Typography>
                        <Tooltip
                            title={<FormattedMessage id="data.key.helper" />}
                        >
                            <IconButton>
                                <HelpCircle />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <Stack
                        direction="row"
                        component="ol"
                        sx={{
                            overflowY: 'auto',
                            pl: 0,
                        }}
                    >
                        {!value ? (
                            <AlertBox severity="warning" short>
                                <FormattedMessage id="keyAutoComplete.keys.missing" />
                            </AlertBox>
                        ) : (
                            value.map((key: string) => {
                                let icon;
                                return (
                                    <ListItem
                                        key={`read-only-key-${keys}`}
                                        dense
                                        sx={{ px: 0.5 }}
                                    >
                                        <Chip icon={icon} label={key} />
                                    </ListItem>
                                );
                            })
                        )}
                    </Stack>
                </Stack>
            </Grid>
        );
    }

    return (
        <Grid item xs={12}>
            <Autocomplete
                {...autoCompleteDefaults_Virtual_Multiple}
                onChange={changeHandler}
                readOnly={disableInput}
                defaultValue={defaultValue}
                options={keys}
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
