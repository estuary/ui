import { Skeleton } from '@mui/material';
import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { noop } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    updateStoreState?: (value?: string) => void;
}

function TenantSelector({ updateStoreState }: Props) {
    const intl = useIntl();

    const tenantNames = useEntitiesStore_tenantsWithAdmin();
    const tenantNamesHaveLength = useMemo(
        () => hasLength(tenantNames),
        [tenantNames]
    );

    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const setSelectedTenant = useTenantStore(
        (state) => state.setSelectedTenant
    );

    const handledDefault = useRef(false);
    const defaultSelectedTenant = useGlobalSearchParams(
        GlobalSearchParams.PREFIX
    );
    const [inputValue, setInputValue] = useState('');
    const [defaultValue, setDefaultValue] = useState<string | null>(null);

    const updateState = useCallback(
        (value: string) => {
            if (updateStoreState) {
                updateStoreState(value);
            }

            setSelectedTenant(value);
            setInputValue(value);
        },
        [setInputValue, setSelectedTenant, updateStoreState]
    );

    useEffect(() => {
        if (tenantNamesHaveLength) {
            // Try using the value from the URL first so if the param gets updated the dropdown changes
            const newVal =
                hasLength(defaultSelectedTenant) &&
                tenantNames.includes(defaultSelectedTenant)
                    ? defaultSelectedTenant
                    : hasLength(selectedTenant) &&
                        tenantNames.includes(selectedTenant)
                      ? selectedTenant
                      : tenantNames[0];

            updateState(newVal);

            if (!handledDefault.current) {
                setDefaultValue(defaultValue);
                handledDefault.current = true;
            }
        }
    }, [
        defaultSelectedTenant,
        defaultValue,
        selectedTenant,
        tenantNames,
        tenantNamesHaveLength,
        updateState,
    ]);

    return selectedTenant && tenantNamesHaveLength ? (
        <AutocompletedField
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            options={tenantNames}
            changeHandler={noop}
            autocompleteSx={{ flexGrow: 1 }}
            AutoCompleteOptions={{
                inputValue,
                onInputChange: (_event, newInputValue) => {
                    setInputValue(newInputValue);
                },
                onChange: (_event, newAutoCompleteValue) => {
                    setSelectedTenant(newAutoCompleteValue);
                },
                value: selectedTenant,
            }}
        />
    ) : (
        <Skeleton sx={{ flexGrow: 1 }} />
    );
}

export default TenantSelector;
