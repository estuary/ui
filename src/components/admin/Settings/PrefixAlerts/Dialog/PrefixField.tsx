import type { PrefixFieldProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { TextField } from '@mui/material';

import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant';
import { appendWithForwardSlash } from 'src/utils/misc-utils';

export default function PrefixField({ staticPrefix }: PrefixFieldProps) {
    const intl = useIntl();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const objectRoles = useEntitiesStore_capabilities_adminable();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const prefixErrorsExist = useAlertSubscriptionsStore(
        (state) => state.prefixErrorsExist
    );
    const setSubscribedPrefix = useAlertSubscriptionsStore(
        (state) => state.setSubscribedPrefix
    );

    useMount(() => {
        const evaluatedPrefix =
            staticPrefix && staticPrefix.length > 0
                ? staticPrefix
                : selectedTenant;

        if (evaluatedPrefix.length > 0) {
            setSubscribedPrefix(evaluatedPrefix, null);
        }
    });

    return staticPrefix ? (
        <TextField
            disabled
            fullWidth
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            required
            size="small"
            slotProps={{
                input: {
                    sx: { borderRadius: 3 },
                },
            }}
            value={staticPrefix}
            variant="outlined"
        />
    ) : (
        <LeavesAutocomplete
            error={prefixErrorsExist}
            errorMessage={prefixErrorsExist ? 'Error' : undefined}
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            leaves={objectRoles}
            onBlur={() =>
                setSubscribedPrefix(appendWithForwardSlash(catalogPrefix), null)
            }
            onChange={(value) => {
                setSubscribedPrefix(
                    value.startsWith(selectedTenant) ? value : selectedTenant,
                    null
                );
            }}
            required
            textFieldVariant="outlined"
            value={catalogPrefix}
        />
    );
}
