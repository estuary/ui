import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
    FormStatus,
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState';

function Status() {
    const formStatus = useFormStateStore_status();

    const isActive = useFormStateStore_isActive();

    let messageKey;
    if (formStatus === FormStatus.TESTED || formStatus === FormStatus.SAVED) {
        messageKey = 'common.success';
    } else if (formStatus === FormStatus.FAILED) {
        messageKey = 'common.fail';
    } else if (isActive) {
        messageKey = 'common.running';
    }

    if (messageKey) {
        return (
            <Typography sx={{ mr: 1 }}>
                <FormattedMessage id={messageKey} />
            </Typography>
        );
    } else {
        return null;
    }
}

export default Status;
