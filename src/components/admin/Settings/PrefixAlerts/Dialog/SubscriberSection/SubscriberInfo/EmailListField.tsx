import type { EmailListFieldProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { TextField } from '@mui/material';

import { useIntl } from 'react-intl';

import EmailSelector from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo/EmailSelector';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

const EmailListField = ({ subscription, staticEmail }: EmailListFieldProps) => {
    const intl = useIntl();

    const duplicatePrefixExists = useAlertSubscriptionsStore(
        (state) => state.duplicateEmailExists
    );

    return staticEmail || duplicatePrefixExists ? (
        <TextField
            disabled
            fullWidth
            label={intl.formatMessage({
                id: 'data.email',
            })}
            required
            size="small"
            slotProps={{
                input: {
                    sx: { borderRadius: 3 },
                },
            }}
            value={staticEmail ?? subscription.email}
            variant="outlined"
        />
    ) : (
        <EmailSelector subscription={subscription} />
    );
};

export default EmailListField;
