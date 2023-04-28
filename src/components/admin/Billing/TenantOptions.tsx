import { Skeleton } from '@mui/material';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useIntl } from 'react-intl';
import {
    useBilling_setSelectedTenant,
    useBilling_tenants,
} from 'stores/Billing/hooks';

function TenantOptions() {
    const intl = useIntl();

    const tenants = useBilling_tenants();
    const setSelectedTenant = useBilling_setSelectedTenant();

    return tenants.length > 0 ? (
        <AutocompletedField
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            options={tenants}
            defaultValue={tenants[0]}
            changeHandler={(_event, value) => setSelectedTenant(value)}
            autocompleteSx={{ flexGrow: 1 }}
        />
    ) : (
        <Skeleton sx={{ flexGrow: 1 }} />
    );
}

export default TenantOptions;
