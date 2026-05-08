import type { EmailListFieldProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { TextField } from '@mui/material';

import { useIntl } from 'react-intl';

import EmailSelector from 'src/components/admin/Settings/PrefixAlerts/EmailSelector';

const EmailListField = ({ staticEmail }: EmailListFieldProps) => {
    const intl = useIntl();

    return staticEmail ? (
        <TextField
            InputProps={{
                sx: { borderRadius: 3 },
            }}
            disabled
            fullWidth
            label={intl.formatMessage({
                id: 'data.email',
            })}
            required
            size="small"
            value={staticEmail}
            variant="outlined"
        />
    ) : (
        <EmailSelector />
    );
};

export default EmailListField;
