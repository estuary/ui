import { Skeleton } from '@mui/material';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useTenantDetails } from 'context/fetcher/Tenant';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { noop } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTenantStore } from 'stores/Tenant/Store';
import { hasLength } from 'utils/misc-utils';

interface Props {
    updateStoreState?: (value?: string) => void;
}

function TenantSelector({ updateStoreState }: Props) {
    const intl = useIntl();

    const { tenants } = useTenantDetails();
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

    const tenantNames = useMemo<string[] | null>(
        () =>
            tenants && tenants.length > 0
                ? tenants.map(({ tenant }) => tenant)
                : null,
        [tenants]
    );

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
        if (tenantNames) {
            // Try using the value from the URL first so if the param gets updated the dropdown changes
            const newVal =
                hasLength(defaultSelectedTenant) &&
                tenantNames.includes(defaultSelectedTenant)
                    ? defaultSelectedTenant
                    : tenantNames[0];

            updateState(newVal);

            if (!handledDefault.current) {
                setDefaultValue(defaultValue);
                handledDefault.current = true;
            }
        }
    }, [defaultSelectedTenant, defaultValue, tenantNames, updateState]);

    return selectedTenant && tenantNames ? (
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
