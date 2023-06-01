import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Button,
    Grid,
    TextField,
} from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { generateGrantDirective } from 'api/directives';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useZustandStore } from 'context/Zustand/provider';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { hasLength } from 'utils/misc-utils';

interface Props {
    objectRoles: string[];
    serverError: PostgrestError | null;
    setServerError: React.Dispatch<React.SetStateAction<PostgrestError | null>>;
}

const namePattern = new RegExp(`^[a-zA-Z0-9-_./]+$`);

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.

const capabilityOptions = ['admin', 'read'];

const typeOptions = ['single-use', 'multi-use'];

function GenerateInvitation({
    objectRoles,
    serverError,
    setServerError,
}: Props) {
    const intl = useIntl();

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.ACCESS_GRANTS_LINKS,
        selectableTableStoreSelectors.query.hydrate
    );

    const [prefix, setPrefix] = useState<string>(objectRoles[0]);
    const [prefixMissing, setPrefixMissing] = useState(false);
    const [prefixInvalid, setPrefixInvalid] = useState(false);

    const [capability, setCapability] = useState<string>(capabilityOptions[0]);
    const [reusability, setReusability] = useState<string>(typeOptions[0]);

    const handlers = {
        setGrantPrefix: (_event: React.SyntheticEvent, value: string) => {
            if (serverError) {
                setServerError(null);
            }

            setPrefixMissing(!hasLength(value));
            setPrefixInvalid(!namePattern.test(value));

            const processedValue = value.endsWith('/') ? value : `${value}/`;

            setPrefix(processedValue);
        },
        setGrantCapability: (_event: React.SyntheticEvent, value: string) => {
            if (serverError) {
                setServerError(null);
            }

            setCapability(value);
        },
        setGrantReusability: (_event: React.SyntheticEvent, value: string) => {
            if (serverError) {
                setServerError(null);
            }

            setReusability(value);
        },
        generateInvitation: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            generateGrantDirective(
                prefix,
                capability,
                reusability === 'single-use'
            ).then(
                (response) => {
                    if (response.error) {
                        setServerError(response.error);
                    } else if (hasLength(response.data)) {
                        if (serverError) {
                            setServerError(null);
                        }

                        hydrate();
                    }
                },
                (error) => setServerError(error)
            );
        },
    };

    return (
        <Grid container spacing={2} sx={{ mb: 5, pt: 1 }}>
            <Grid item xs={12} md={5}>
                <Autocomplete
                    options={objectRoles}
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
                                id: 'common.tenant',
                            })}
                            variant="outlined"
                            size="small"
                            error={prefixMissing || prefixInvalid}
                        />
                    )}
                    defaultValue={objectRoles[0]}
                    freeSolo
                    disableClearable
                    onInputChange={handlers.setGrantPrefix}
                />

                {/* <AutocompletedField
                    label={intl.formatMessage({
                        id: 'common.tenant',
                    })}
                    options={objectRoles}
                    defaultValue={objectRoles[0]}
                    changeHandler={handlers.setGrantPrefix}
                /> */}
            </Grid>

            <Grid item xs={4} md={2}>
                <AutocompletedField
                    label={intl.formatMessage({
                        id: 'admin.users.prefixInvitation.label.capability',
                    })}
                    options={capabilityOptions}
                    defaultValue={capabilityOptions[0]}
                    changeHandler={handlers.setGrantCapability}
                />
            </Grid>

            <Grid item xs={4} md={2}>
                <AutocompletedField
                    label={intl.formatMessage({
                        id: 'admin.users.prefixInvitation.label.type',
                    })}
                    options={typeOptions}
                    defaultValue={typeOptions[0]}
                    changeHandler={handlers.setGrantReusability}
                />
            </Grid>

            <Grid item xs={4} md={3} sx={{ display: 'flex' }}>
                <Button
                    onClick={handlers.generateInvitation}
                    sx={{ flexGrow: 1 }}
                >
                    <FormattedMessage id="admin.users.prefixInvitation.cta.generateLink" />
                </Button>
            </Grid>
        </Grid>
    );
}

export default GenerateInvitation;
