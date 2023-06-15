import { Skeleton } from '@mui/material';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useTenantDetails } from 'context/fetcher/Tenant';
import { useZustandStore } from 'context/Zustand/provider';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import {
    useBilling_resetState,
    useBilling_setSelectedTenant,
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

    const tenants = useTenantDetails();

    // Billing Store
    const setSelectedTenant = useBilling_setSelectedTenant();
    const resetBillingState = useBilling_resetState();

    // Billing Select Table Store
    const setHydrated = useBillingTable_setHydrated();
    const setHydrationErrorsExist = useBillingTable_setHydrationErrorsExist();

    const resetBillingSelectTableState = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetState']
    >(SelectTableStoreNames.BILLING, selectableTableStoreSelectors.state.reset);

    useEffect(() => {
        if (tenants && tenants.length > 0) {
            setSelectedTenant(tenants[0].tenant);
        }
    }, [setSelectedTenant, tenants]);

    return tenants && tenants.length > 0 ? (
        <AutocompletedField
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            options={tenants.map(({ tenant }) => tenant)}
            defaultValue={tenants[0].tenant}
            changeHandler={(_event, value) => {
                resetBillingState();
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
