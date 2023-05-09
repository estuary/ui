import { Button, Grid } from '@mui/material';
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
    const [capability, setCapability] = useState<string>(capabilityOptions[0]);
    const [reusability, setReusability] = useState<string>(typeOptions[0]);

    const handlers = {
        setGrantPrefix: (_event: React.SyntheticEvent, value: string) => {
            if (serverError) {
                setServerError(null);
            }

            setPrefix(value);
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
        <Grid container spacing={2} sx={{ mb: 5 }}>
            <Grid item xs={12} md={5}>
                <AutocompletedField
                    label={intl.formatMessage({
                        id: 'common.tenant',
                    })}
                    options={objectRoles}
                    defaultValue={objectRoles[0]}
                    changeHandler={handlers.setGrantPrefix}
                />
            </Grid>

            <Grid item xs={4} md={2}>
                <AutocompletedField
                    label={intl.formatMessage({
                        id: 'admin.users.sharePrefix.label.capability',
                    })}
                    options={capabilityOptions}
                    defaultValue={capabilityOptions[0]}
                    changeHandler={handlers.setGrantCapability}
                />
            </Grid>

            <Grid item xs={4} md={2}>
                <AutocompletedField
                    label={intl.formatMessage({
                        id: 'admin.users.sharePrefix.label.type',
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
                    <FormattedMessage id="admin.users.sharePrefix.cta.generateLink" />
                </Button>
            </Grid>
        </Grid>
    );
}

export default GenerateInvitation;
