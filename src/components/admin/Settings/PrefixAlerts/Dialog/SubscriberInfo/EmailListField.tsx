import type { EmailListFieldProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { TextField } from '@mui/material';

import { useIntl } from 'react-intl';

import EmailSelector from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberInfo/EmailSelector';

const EmailListField = ({ subscription, staticEmail }: EmailListFieldProps) => {
    const intl = useIntl();

    return staticEmail ? (
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
            value={staticEmail}
            variant="outlined"
        />
    ) : (
        <EmailSelector subscription={subscription} />
    );
};

export default EmailListField;
