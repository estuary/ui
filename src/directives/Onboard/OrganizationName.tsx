import { FormControl, FormLabel, TextField } from '@mui/material';
import {
    useOnboardingStore_nameInvalid,
    useOnboardingStore_nameMissing,
    useOnboardingStore_requestedTenant,
    useOnboardingStore_setNameInvalid,
    useOnboardingStore_setNameMissing,
    useOnboardingStore_setRequestedTenant,
} from 'directives/Onboard/Store/hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';

function OrganizationNameField() {
    const intl = useIntl();

    // Onboarding Store
    const nameInvalid = useOnboardingStore_nameInvalid();
    const setNameInvalid = useOnboardingStore_setNameInvalid();

    const nameMissing = useOnboardingStore_nameMissing();
    const setNameMissing = useOnboardingStore_setNameMissing();

    const requestedTenant = useOnboardingStore_requestedTenant();
    const setRequestedTenant = useOnboardingStore_setRequestedTenant();

    const handlers = {
        update: (updatedValue: string) => {
            const pattern = new RegExp(`^${PREFIX_NAME_PATTERN}$`);

            setNameInvalid(!pattern.test(updatedValue));

            setRequestedTenant(updatedValue);

            if (nameMissing) setNameMissing(!hasLength(updatedValue));
        },
    };

    return (
        <FormControl>
            <FormLabel id="origin" required sx={{ mb: 1, fontSize: 16 }}>
                <FormattedMessage id="tenant.input.label" />
            </FormLabel>

            <TextField
                size="small"
                placeholder={intl.formatMessage({
                    id: 'tenant.input.placeholder',
                })}
                helperText={intl.formatMessage({
                    id:
                        nameMissing || nameInvalid
                            ? 'tenant.expectations.error'
                            : 'tenant.expectations',
                })}
                error={nameMissing || nameInvalid}
                id="requestedTenant"
                label={<FormattedMessage id="common.tenant.creationForm" />}
                value={requestedTenant}
                onChange={(event) => handlers.update(event.target.value)}
                required
                inputProps={{
                    pattern: PREFIX_NAME_PATTERN,
                }}
                sx={{
                    'maxWidth': 424,
                    '& .MuiInputBase-root': { borderRadius: 3 },
                }}
            />
        </FormControl>
    );
}

export default OrganizationNameField;
