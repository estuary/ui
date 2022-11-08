import { AlertColor, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import AlertBox from '../AlertBox';

function Status() {
    const formStatus = useFormStateStore_status();
    const isActive = useFormStateStore_isActive();

    let severity: AlertColor | undefined, messageKey;
    if (formStatus === FormStatus.TESTED || formStatus === FormStatus.SAVED) {
        messageKey = 'common.success';
        severity = 'success';
    } else if (formStatus === FormStatus.FAILED) {
        messageKey = 'common.fail';
        severity = 'error';
    } else if (isActive) {
        messageKey = 'common.running';
    }

    if (messageKey) {
        if (severity) {
            return (
                <AlertBox severity={severity} short>
                    <Typography sx={{ mr: 1 }}>
                        <FormattedMessage id={messageKey} />
                    </Typography>
                </AlertBox>
            );
        } else {
            return (
                <Typography sx={{ mr: 1 }}>
                    <FormattedMessage id={messageKey} />
                </Typography>
            );
        }
    } else {
        return null;
    }
}

export default Status;
