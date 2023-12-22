import { Skeleton } from '@mui/material';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useZustandStore } from 'context/Zustand/provider';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { noop } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useBilling_resetState,
    useBilling_setSelectedTenant,
} from 'stores/Billing/hooks';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { SelectTableStoreNames } from 'stores/names';
import {
    useBillingTable_setHydrated,
    useBillingTable_setHydrationErrorsExist,
} from 'stores/Tables/Billing/hooks';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { hasLength } from 'utils/misc-utils';

function TenantOptions() {
    const intl = useIntl();

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);

    // AutoComplete
    const handledDefault = useRef(false);
    const defaultSelectedTenant = useGlobalSearchParams(
        GlobalSearchParams.PREFIX
    );
    const [autoCompleteValue, setAutoCompleteValue] = useState<string | null>(
        null
    );
    const [inputValue, setInputValue] = useState('');
    const [defaultValue, setDefaultValue] = useState<string | null>(null);

    const setSelectedTenant = useBilling_setSelectedTenant();
    const resetBillingState = useBilling_resetState();

    const setHydrated = useBillingTable_setHydrated();
    const setHydrationErrorsExist = useBillingTable_setHydrationErrorsExist();

    const resetBillingSelectTableState = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetState']
    >(SelectTableStoreNames.BILLING, selectableTableStoreSelectors.state.reset);

    const tenantNames = useMemo<string[] | null>(
        () => (objectRoles.length > 0 ? objectRoles : null),
        [objectRoles]
    );

    const updateStateAndStore = useCallback(
        (newValue: string) => {
            resetBillingState();
            setSelectedTenant(newValue);
            setInputValue(newValue);
            setAutoCompleteValue(newValue);

            resetBillingSelectTableState();
            setHydrated(false);
            setHydrationErrorsExist(false);
        },
        [
            resetBillingSelectTableState,
            resetBillingState,
            setHydrated,
            setHydrationErrorsExist,
            setSelectedTenant,
        ]
    );

    useEffect(() => {
        if (tenantNames) {
            // Try using the value from the URL first so if the param gets updated the dropdown changes
            const newVal =
                hasLength(defaultSelectedTenant) &&
                tenantNames.includes(defaultSelectedTenant)
                    ? defaultSelectedTenant
                    : tenantNames[0];

            updateStateAndStore(newVal);

            if (!handledDefault.current) {
                setDefaultValue(newVal);
                handledDefault.current = true;
            }
        }
    }, [defaultSelectedTenant, tenantNames, updateStateAndStore]);

    return defaultValue && tenantNames ? (
        <AutocompletedField
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            options={tenantNames}
            defaultValue={defaultValue}
            changeHandler={noop}
            autocompleteSx={{ flexGrow: 1 }}
            AutoCompleteOptions={{
                inputValue,
                onInputChange: (_event, newInputValue) => {
                    setInputValue(newInputValue);
                },
                onChange: (_event, newAutoCompleteValue) => {
                    updateStateAndStore(newAutoCompleteValue);
                },
                value: autoCompleteValue,
            }}
        />
    ) : (
        <Skeleton sx={{ flexGrow: 1 }} />
    );
}

export default TenantOptions;
