import { FormControl, FormLabel, TextField } from '@mui/material';
import {
    useOnboardingStore_nameInvalid,
    useOnboardingStore_nameMissing,
    useOnboardingStore_requestedTenant,
    useOnboardingStore_setRequestedTenant,
} from 'directives/Onboard/Store/hooks';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    forceError?: boolean;
}

function OrganizationNameField({ forceError }: Props) {
    const intl = useIntl();

    // Onboarding Store
    const nameInvalid = useOnboardingStore_nameInvalid();
    const nameMissing = useOnboardingStore_nameMissing();
    const requestedTenant = useOnboardingStore_requestedTenant();
    const setRequestedTenant = useOnboardingStore_setRequestedTenant();

    const handlers = {
        update: (updatedValue: string) => {
            setRequestedTenant(updatedValue);
        },
    };

    const showError = Boolean(nameMissing || nameInvalid || forceError);

    return (
        <FormControl error={showError}>
            <FormLabel id="origin" required sx={{ mb: 1, fontSize: 20 }}>
                <FormattedMessage id="tenant.input.label" />
            </FormLabel>

            <TextField
                autoComplete="organization"
                autoFocus
                error={showError}
                helperText={intl.formatMessage({
                    id:
                        nameMissing || nameInvalid
                            ? 'tenant.expectations.error'
                            : 'tenant.expectations',
                })}
                id="requestedTenant"
                label={<FormattedMessage id="common.tenant.creationForm" />}
                onChange={(event) => handlers.update(event.target.value)}
                placeholder={intl.formatMessage({
                    id: 'tenant.input.placeholder',
                })}
                required
                size="small"
                value={requestedTenant}
                variant="outlined"
                sx={{
                    'maxWidth': 424,
                    '& .MuiInputBase-root': { borderRadius: 3 },
                }}
            />
        </FormControl>
    );
}

export default OrganizationNameField;
