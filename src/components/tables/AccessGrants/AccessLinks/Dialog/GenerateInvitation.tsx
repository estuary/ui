import type { GenerateInvitationProps } from 'src/components/tables/AccessGrants/AccessLinks/Dialog/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useState } from 'react';

import { Button, Grid } from '@mui/material';

import { useIntl } from 'react-intl';

import { generateGrantDirective } from 'src/api/directives';
import PrefixedName from 'src/components/inputs/PrefixedName';
import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';
import NestingWarning from 'src/components/tables/AccessGrants/AccessLinks/Dialog/NestingWarning';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { appendWithForwardSlash, hasLength } from 'src/utils/misc-utils';

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.
const capabilityOptions = ['admin', 'read'];
const typeOptions = ['single-use', 'multi-use'];

function GenerateInvitation({
    serverError,
    setServerError,
}: GenerateInvitationProps) {
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

    const [showNestingWarning, setShowNestingWarning] =
        useState<boolean>(false);

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

    const onChange = (value: string, errors: string | null) => {
        if (serverError) {
            setServerError(null);
        }

        setObjectRole(value);
        setObjectRoleHasErrors(Boolean(errors));
    };

    return (
        <Grid
            container
            spacing={2}
            sx={{ mb: 5, pt: 1, alignItems: 'flex-start' }}
        >
            <Grid
                item
                xs={12}
                sx={showNestingWarning ? { mb: 1 } : { display: 'none' }}
            >
                <NestingWarning
                    objectRole={objectRole}
                    show={showNestingWarning}
                />
            </Grid>

            <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                <PrefixedName
                    allowBlankName
                    allowEndSlash
                    defaultPrefix
                    label={intl.formatMessage({
                        id: 'common.tenant',
                    })}
                    onChange={onChange}
                    onNameChange={(prefixedName) => {
                        setShowNestingWarning(
                            Boolean(prefixedName && prefixedName.length > 0)
                        );
                    }}
                    required
                    validateOnLoad
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
                    {intl.formatMessage({
                        id: 'admin.users.prefixInvitation.cta.generateLink',
                    })}
                </Button>
            </Grid>
        </Grid>
    );
}

export default GenerateInvitation;
