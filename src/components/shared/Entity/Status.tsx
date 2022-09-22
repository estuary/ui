import { Alert, AlertColor, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
    FormStatus,
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState';

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
                <Alert
                    severity={severity}
                    variant="outlined"
                    sx={{ border: 0 }}
                >
                    <Typography sx={{ mr: 1 }}>
                        <FormattedMessage id={messageKey} />
                    </Typography>
                </Alert>
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
