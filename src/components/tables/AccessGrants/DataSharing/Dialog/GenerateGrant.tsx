import { Button, Grid, SelectChangeEvent, TextField } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { createRoleGrant } from 'api/roleGrants';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import SelectTextField from 'components/shared/toolbar/SelectTextField';
import { useZustandStore } from 'context/Zustand/provider';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { Capability } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    objectRoles: string[];
    serverError: PostgrestError | null;
    setServerError: React.Dispatch<React.SetStateAction<PostgrestError | null>>;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const namePattern = new RegExp(`^[a-zA-Z0-9-_./]+$`);

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.

const capabilityOptions: Capability[] = ['read', 'admin'];

function GenerateGrant({
    objectRoles,
    serverError,
    setServerError,
    setOpen,
}: Props) {
    const intl = useIntl();

    // Access Grant Select Table Store
    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.ACCESS_GRANTS_PREFIXES,
        selectableTableStoreSelectors.query.hydrate
    );

    // Notification Store
    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    const [objectMissing, setObjectMissing] = useState(false);
    const [objectInvalid, setObjectInvalid] = useState(false);

    const [subjectMissing, setSubjectMissing] = useState(false);
    const [subjectInvalid, setSubjectInvalid] = useState(false);

    const [objectPrefix, setObjectPrefix] = useState<string>(objectRoles[0]);
    const [objectSuffix, setObjectSuffix] = useState<string>('');
    const [subjectRole, setSubjectRole] = useState<string>('');
    const [capability, setCapability] = useState<Capability>(
        capabilityOptions[0]
    );

    const handlers = {
        evaluateObjectRolePrefix: (event: SelectChangeEvent<string>) => {
            if (serverError) {
                setServerError(null);
            }

            const value = event.target.value;

            setObjectMissing(!hasLength(value));

            setObjectPrefix(value);
        },
        evaluateObjectRoleSuffix: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (serverError) {
                setServerError(null);
            }

            const value = event.target.value.replaceAll(/\s/g, '_');

            setObjectInvalid(hasLength(value) && !namePattern.test(value));

            const processedValue =
                hasLength(value) && !value.endsWith('/') ? `${value}/` : value;

            setObjectSuffix(processedValue);
        },
        evaluateSubjectRole: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (serverError) {
                setServerError(null);
            }

            const value = event.target.value.replaceAll(/\s/g, '_');

            setSubjectMissing(!hasLength(value));
            setSubjectInvalid(!namePattern.test(value));

            const processedValue = value.endsWith('/') ? value : `${value}/`;

            setSubjectRole(processedValue);
        },
        setGrantCapability: (_event: React.SyntheticEvent, value: string) => {
            if (serverError) {
                setServerError(null);
            }

            setCapability(value as Capability);
        },
        generateRoleGrant: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const objectRole = `${objectPrefix}${objectSuffix}`;

            createRoleGrant(subjectRole, objectRole, capability).then(
                (response) => {
                    if (response.error) {
                        setServerError(response.error);
                    } else if (hasLength(response.data)) {
                        if (serverError) {
                            setServerError(null);
                        }

                        showNotification({
                            description: intl.formatMessage(
                                {
                                    id: 'admin.prefix.issueGrant.notification.success.message',
                                },
                                { objectRole, subjectRole }
                            ),
                            severity: 'success',
                            title: intl.formatMessage({
                                id: 'admin.prefix.issueGrant.notification.success.title',
                            }),
                        });

                        hydrate();

                        setOpen(false);
                    }
                },
                (error) => setServerError(error)
            );
        },
    };

    return (
        <Grid container spacing={2} sx={{ mb: 5, pt: 1 }}>
            <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                <SelectTextField
                    label={intl.formatMessage({
                        id: 'admin.prefix.issueGrant.label.sharedPrefix',
                    })}
                    defaultSelectValue={objectPrefix}
                    selectValues={objectRoles}
                    selectChangeHandler={handlers.evaluateObjectRolePrefix}
                    textChangeHandler={handlers.evaluateObjectRoleSuffix}
                    errorExists={objectMissing || objectInvalid}
                />
            </Grid>

            <Grid item xs={4} md={3} sx={{ display: 'flex' }}>
                <TextField
                    variant="outlined"
                    size="small"
                    label={intl.formatMessage({
                        id: 'admin.prefix.issueGrant.label.sharedWith',
                    })}
                    InputProps={{
                        sx: { borderRadius: 3 },
                    }}
                    error={subjectMissing || subjectInvalid}
                    onChange={handlers.evaluateSubjectRole}
                    sx={{ flexGrow: 1 }}
                />
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

            <Grid item xs={4} md={3} sx={{ display: 'flex' }}>
                <Button
                    disabled={
                        objectMissing ||
                        objectInvalid ||
                        subjectMissing ||
                        !hasLength(subjectRole) ||
                        subjectInvalid
                    }
                    onClick={handlers.generateRoleGrant}
                    sx={{ flexGrow: 1 }}
                >
                    <FormattedMessage id="admin.prefix.issueGrant.cta.generateGrant" />
                </Button>
            </Grid>
        </Grid>
    );
}

export default GenerateGrant;
