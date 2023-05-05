import { Button, Grid } from '@mui/material';
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

interface Props {
    objectRoles: string[];
}

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.

const capabilityOptions = ['admin', 'read'];

const typeOptions = ['single-use', 'multi-use'];

function GenerateInvitation({ objectRoles }: Props) {
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
            setPrefix(value);
        },
        setGrantCapability: (_event: React.SyntheticEvent, value: string) => {
            setCapability(value);
        },
        setGrantReusability: (_event: React.SyntheticEvent, value: string) => {
            setReusability(value);
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
                    onClick={() => {
                        generateGrantDirective(
                            prefix,
                            capability,
                            reusability === 'single-use'
                        ).then(
                            (response) => {
                                console.log('success', response);

                                hydrate();
                            },
                            (error) => console.log('error', error)
                        );
                    }}
                    sx={{ flexGrow: 1 }}
                >
                    <FormattedMessage id="admin.users.sharePrefix.cta.generateLink" />
                </Button>
            </Grid>
        </Grid>
    );
}

export default GenerateInvitation;
