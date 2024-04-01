import { Skeleton } from '@mui/material';
import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import { useSelectedTenant, useTenantDetails } from 'context/fetcher/Tenant';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { noop } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

function TenantOptions() {
    const intl = useIntl();

    const tenants = useTenantDetails();
    const { selectedTenant, setSelectedTenant } = useSelectedTenant();

    const handledDefault = useRef(false);
    const defaultSelectedTenant = useGlobalSearchParams(
        GlobalSearchParams.PREFIX
    );
    const [inputValue, setInputValue] = useState('');
    const [defaultValue, setDefaultValue] = useState<string | null>(null);

    const tenantNames = useMemo<string[] | null>(
        () => (tenants.length > 0 ? tenants.map(({ tenant }) => tenant) : null),
        [tenants]
    );

    useEffect(() => {
        if (tenantNames) {
            // Try using the value from the URL first so if the param gets updated the dropdown changes
            const newVal =
                hasLength(defaultSelectedTenant) &&
                tenantNames.includes(defaultSelectedTenant)
                    ? defaultSelectedTenant
                    : tenantNames[0];

            setSelectedTenant(newVal);

            if (!handledDefault.current) {
                setDefaultValue(defaultValue);
                handledDefault.current = true;
            }
        }
    }, [defaultSelectedTenant, defaultValue, setSelectedTenant, tenantNames]);

    return selectedTenant && tenantNames ? (
        <AutocompletedField
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            options={tenantNames}
            defaultValue={defaultValue ?? selectedTenant}
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

export default TenantOptions;
