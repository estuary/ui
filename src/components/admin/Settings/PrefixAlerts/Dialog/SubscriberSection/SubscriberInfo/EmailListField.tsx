import type { EmailListFieldProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { TextField } from '@mui/material';

import EmailSelector from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo/EmailSelector';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

const EmailListField = ({ subscription, staticEmail }: EmailListFieldProps) => {
    const duplicatePrefixExists = useAlertSubscriptionsStore(
        (state) => state.duplicatePrefixExists
    );

    return staticEmail || duplicatePrefixExists ? (
        <TextField
            disabled
            fullWidth
            label="Email"
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
