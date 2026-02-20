import type { PostgrestError } from '@supabase/postgrest-js';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import type { SelectableTableStore } from 'src/stores/Tables/Store';
import type { Capability } from 'src/types';

import { useMemo, useState } from 'react';

import { Button, Grid, TextField } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import { createRoleGrant } from 'src/api/roleGrants';
import PrefixedName from 'src/components/inputs/PrefixedName';
import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'src/stores/NotificationStore';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { appendWithForwardSlash, hasLength } from 'src/utils/misc-utils';
import { PREFIX_NAME_PATTERN } from 'src/validation';

interface Props {
    serverError: PostgrestError | null;
    setServerError: React.Dispatch<React.SetStateAction<PostgrestError | null>>;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const namePattern = new RegExp(
    `^(${PREFIX_NAME_PATTERN}/)*${PREFIX_NAME_PATTERN}/?$`
);

const capabilityOptions: Capability[] = ['read', 'admin', 'write'];

function GenerateGrant({ serverError, setServerError, setOpen }: Props) {
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

    const [subjectMissing, setSubjectMissing] = useState(false);
    const [subjectInvalid, setSubjectInvalid] = useState(false);

    const [objectRole, setObjectRole] = useState('');
    const [objectRoleHasErrors, setObjectRoleHasErrors] = useState(false);
    const [subjectRole, setSubjectRole] = useState('');
    const [capability, setCapability] = useState(capabilityOptions[0]);

    const handlers = {
        evaluateSubjectRole: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (serverError) {
                setServerError(null);
            }

            const value = event.target.value.replaceAll(/\s/g, '_');

            setSubjectMissing(!hasLength(value));
            setSubjectInvalid(!namePattern.test(value));
            setSubjectRole(value);
        },
        setGrantCapability: (_event: React.SyntheticEvent, value: string) => {
            if (serverError) {
                setServerError(null);
            }

            setCapability(value as Capability);
        },
        generateRoleGrant: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const processedSubject = appendWithForwardSlash(subjectRole);
            const processedObject = appendWithForwardSlash(objectRole);

            createRoleGrant(processedSubject, processedObject, capability).then(
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
                                {
                                    objectRole: processedObject,
                                    subjectRole: processedSubject,
                                }
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

    const formInvalid = useMemo(
        () =>
            objectRoleHasErrors ||
            subjectMissing ||
            !hasLength(subjectRole) ||
            subjectInvalid,
        [objectRoleHasErrors, subjectInvalid, subjectMissing, subjectRole]
    );

    const onChange = (value: string, errors: string | null) => {
        setObjectRole(value);
        setObjectRoleHasErrors(Boolean(errors));
    };

    return (
        <Grid
            container
            spacing={2}
            sx={{ mb: 5, pt: 1, alignItems: 'flex-start' }}
        >
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
                <PrefixedName
                    allowBlankName
                    allowEndSlash
                    defaultPrefix
                    required
                    label={intl.formatMessage({
                        id: 'admin.prefix.issueGrant.label.sharedPrefix',
                    })}
                    onChange={onChange}
                    validateOnLoad
                />
            </Grid>

            <Grid size={{ xs: 4, md: 3 }} sx={{ display: 'flex' }}>
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
                    required
                    value={subjectRole}
                />
            </Grid>

            <Grid size={{ xs: 4, md: 2 }}>
                <AutocompletedField
                    label={intl.formatMessage({
                        id: 'admin.users.prefixInvitation.label.capability',
                    })}
                    options={capabilityOptions}
                    defaultValue={capabilityOptions[0]}
                    changeHandler={handlers.setGrantCapability}
                    required
                />
            </Grid>

            <Grid size={{ xs: 4, md: 3 }} sx={{ display: 'flex' }}>
                <Button
                    disabled={formInvalid}
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
