import type { PrefixFieldProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { TextField } from '@mui/material';

import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import PrefixedName from 'src/components/inputs/PrefixedName';

export default function PrefixField({ staticPrefix }: PrefixFieldProps) {
    const intl = useIntl();

    const setSubscribedPrefix = useAlertSubscriptionsStore(
        (state) => state.setSubscribedPrefix
    );

    useMount(() => {
        if (staticPrefix && staticPrefix.length > 0) {
            setSubscribedPrefix(staticPrefix, null);
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
        <PrefixedName
            allowBlankName
            allowEndSlash
            fixedPrefix
            label={intl.formatMessage({
                id: 'common.tenant',
            })}
            onChange={setSubscribedPrefix}
            required
            size="small"
            validateOnLoad
        />
    );
}
