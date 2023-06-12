import { Button, Grid } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { generateGrantDirective } from 'api/directives';
import PrefixedName from 'components/inputs/PrefixedName';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useZustandStore } from 'context/Zustand/provider';
import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { appendWithForwardSlash, hasLength } from 'utils/misc-utils';

interface Props {
    serverError: PostgrestError | null;
    setServerError: React.Dispatch<React.SetStateAction<PostgrestError | null>>;
}

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.

const capabilityOptions = ['admin', 'read'];

const typeOptions = ['single-use', 'multi-use'];

function GenerateInvitation({ serverError, setServerError }: Props) {
    const intl = useIntl();

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.ACCESS_GRANTS_LINKS,
        selectableTableStoreSelectors.query.hydrate
    );

    const [objectRole, setObjectRole] = useState('');
    const [objectRoleHasErrors, setObjectRoleHasErrors] = useState(false);

    const [capability, setCapability] = useState<string>(capabilityOptions[0]);
    const [reusability, setReusability] = useState<string>(typeOptions[0]);

    const handlers = {
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

            const processedObject = appendWithForwardSlash(objectRole);

            generateGrantDirective(
                processedObject,
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

    const onChange = useCallback((value: string, errors: string | null) => {
        setObjectRole(value);
        setObjectRoleHasErrors(Boolean(errors));
    }, []);

    return (
        <Grid
            container
            spacing={2}
            sx={{ mb: 5, pt: 1, alignItems: 'flex-start' }}
        >
            <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                <PrefixedName
                    allowBlankName
                    allowEndSlash
                    defaultPrefix
                    required
                    label={intl.formatMessage({
                        id: 'common.tenant',
                    })}
                    onChange={onChange}
                />
            </Grid>

            <Grid item xs={4} md={2}>
                <AutocompletedField
                    label={intl.formatMessage({
                        id: 'admin.users.prefixInvitation.label.capability',
                    })}
                    required
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
                    required
                    options={typeOptions}
                    defaultValue={typeOptions[0]}
                    changeHandler={handlers.setGrantReusability}
                />
            </Grid>

            <Grid item xs={4} md={3} sx={{ display: 'flex' }}>
                <Button
                    disabled={objectRoleHasErrors}
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
