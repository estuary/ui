import { Skeleton } from '@mui/material';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useZustandStore } from 'context/Zustand/provider';
import { useIntl } from 'react-intl';
import {
    useBilling_setSelectedTenant,
    useBilling_tenants,
} from 'stores/Billing/hooks';
import { SelectTableStoreNames } from 'stores/names';
import {
    useBillingTable_setHydrated,
    useBillingTable_setHydrationErrorsExist,
} from 'stores/Tables/Billing/hooks';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

function TenantOptions() {
    const intl = useIntl();

    // Billing Store
    const tenants = useBilling_tenants();
    const setSelectedTenant = useBilling_setSelectedTenant();

    // Billing Select Table Store
    const setHydrated = useBillingTable_setHydrated();
    const setHydrationErrorsExist = useBillingTable_setHydrationErrorsExist();

    const resetBillingSelectTableState = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetState']
    >(SelectTableStoreNames.BILLING, selectableTableStoreSelectors.state.reset);

    return tenants.length > 0 ? (
        <AutocompletedField
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            options={tenants}
            defaultValue={tenants[0]}
            changeHandler={(_event, value) => {
                setSelectedTenant(value);

                resetBillingSelectTableState();
                setHydrated(false);
                setHydrationErrorsExist(false);
            }}
            autocompleteSx={{ flexGrow: 1 }}
        />
    ) : (
        <Skeleton sx={{ flexGrow: 1 }} />
    );
}

export default TenantOptions;
