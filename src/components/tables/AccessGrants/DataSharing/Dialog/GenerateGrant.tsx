import {
    Button,
    Grid,
    InputAdornment,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { createRoleGrant } from 'api/roleGrants';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useZustandStore } from 'context/Zustand/provider';
import { ChangeEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
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
}

const namePattern = new RegExp(`^[a-zA-Z0-9-_./]+$`);

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.

const capabilityOptions: Capability[] = ['read', 'admin'];

function GenerateGrant({ objectRoles, serverError, setServerError }: Props) {
    const intl = useIntl();

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.ACCESS_GRANTS_PREFIXES,
        selectableTableStoreSelectors.query.hydrate
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
            setObjectInvalid(!namePattern.test(value));

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

            createRoleGrant(
                subjectRole,
                `${objectPrefix}${objectSuffix}`,
                capability
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
            <Grid item xs={12} md={4}>
                <TextField
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {objectRoles.length === 1 ? (
                                    objectRoles[0]
                                ) : (
                                    <Select
                                        size="small"
                                        variant="standard"
                                        value={objectPrefix}
                                        disableUnderline
                                        onChange={
                                            handlers.evaluateObjectRolePrefix
                                        }
                                        sx={{
                                            '& .MuiSelect-select': {
                                                paddingBottom: 0.2,
                                            },
                                        }}
                                    >
                                        {objectRoles.map((prefix) => (
                                            <MenuItem
                                                key={prefix}
                                                value={prefix}
                                            >
                                                {prefix}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 3 },
                    }}
                    label={intl.formatMessage({
                        id: 'admin.prefix.issueGrant.label.sharedPrefix',
                    })}
                    variant="outlined"
                    size="small"
                    error={objectMissing || objectInvalid}
                    onChange={handlers.evaluateObjectRoleSuffix}
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
