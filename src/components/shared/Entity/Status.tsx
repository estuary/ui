import { Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useFormStateStore_message } from 'src/stores/FormState/hooks';

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
