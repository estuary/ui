import { FormattedMessage } from 'react-intl';

import { Typography } from '@mui/material';

import { useFormStateStore_message } from 'stores/FormState/hooks';

import AlertBox from '../AlertBox';

function Status() {
    const { key, severity } = useFormStateStore_message();

    if (key && severity) {
        return (
            <AlertBox severity={severity} short>
                <Typography sx={{ mr: 1 }}>
                    <FormattedMessage id={key} />
                </Typography>
            </AlertBox>
        );
    } else {
        return null;
    }
}

export default Status;
