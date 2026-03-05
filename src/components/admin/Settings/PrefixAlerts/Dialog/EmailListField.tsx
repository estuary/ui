import type { EmailSelectorProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { Grid, TextField } from '@mui/material';

import { useIntl } from 'react-intl';

import EmailSelector from 'src/components/admin/Settings/PrefixAlerts/EmailSelector';

const EmailListField = ({ staticEmail }: EmailSelectorProps) => {
    const intl = useIntl();

    return (
        <Grid
            item
            xs={12}
            md={7}
            sx={{
                maxHeight: 250,
                overflow: 'auto',
                display: 'flex',
            }}
        >
            {staticEmail ? (
                <TextField
                    InputProps={{
                        sx: { borderRadius: 3 },
                    }}
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
            )}
        </Grid>
    );
};

export default EmailListField;
