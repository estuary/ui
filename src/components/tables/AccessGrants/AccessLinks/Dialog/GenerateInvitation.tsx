import { Button, Grid, SelectChangeEvent } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { generateGrantDirective } from 'api/directives';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import SelectTextField from 'components/shared/toolbar/SelectTextField';
import { useZustandStore } from 'context/Zustand/provider';
import { ChangeEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';

interface Props {
    objectRoles: string[];
    serverError: PostgrestError | null;
    setServerError: React.Dispatch<React.SetStateAction<PostgrestError | null>>;
}

const namePattern = new RegExp(`^${PREFIX_NAME_PATTERN}[/]$`);

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

    const [suffix, setSuffix] = useState<string>('');
    const [suffixInvalid, setSuffixInvalid] = useState(false);

    const [capability, setCapability] = useState<string>(capabilityOptions[0]);
    const [reusability, setReusability] = useState<string>(typeOptions[0]);

    const handlers = {
        setGrantPrefix: (event: SelectChangeEvent<string>) => {
            if (serverError) {
                setServerError(null);
            }

            const value = event.target.value;

            setPrefixMissing(!hasLength(value));

            const processedValue = value.endsWith('/') ? value : `${value}/`;

            setPrefix(processedValue);
        },
        setGrantSuffix: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (serverError) {
                setServerError(null);
            }

            const value = event.target.value.replaceAll(/\s/g, '_');

            const processedValue = value.endsWith('/') ? value : `${value}/`;

            setSuffixInvalid(
                hasLength(processedValue) && !namePattern.test(processedValue)
            );

            setSuffix(processedValue);
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
                `${prefix}${suffix}`,
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
            <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                <SelectTextField
                    label={intl.formatMessage({
                        id: 'common.tenant',
                    })}
                    defaultSelectValue={prefix}
                    selectValues={objectRoles}
                    selectChangeHandler={handlers.setGrantPrefix}
                    textChangeHandler={handlers.setGrantSuffix}
                    errorExists={prefixMissing || suffixInvalid}
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
                    disabled={prefixMissing || suffixInvalid}
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
