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
    const prefixErrors = useAlertSubscriptionsStore(
        (state) => state.prefixErrors
    );
    const duplicatePrefixExists = useAlertSubscriptionsStore(
        (state) => state.duplicateEmailExists
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
            setSubscribedPrefix(evaluatedPrefix);
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
            error={prefixErrors.length > 0}
            errorMessage={prefixErrors.length > 0 ? 'Error' : undefined}
            helperText={
                duplicatePrefixExists
                    ? intl.formatMessage({
                          id: 'alerts.config.dialog.prefixField.duplicate',
                      })
                    : undefined
            }
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            leaves={objectRoles}
            onBlur={() =>
                setSubscribedPrefix(appendWithForwardSlash(catalogPrefix))
            }
            onChange={(value) => {
                setSubscribedPrefix(
                    value.startsWith(selectedTenant) ? value : selectedTenant
                );
            }}
            required
            textFieldVariant="outlined"
            value={catalogPrefix}
        />
    );
}
