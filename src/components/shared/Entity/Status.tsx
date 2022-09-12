import { Typography } from '@mui/material';
import { FormStateStoreNames, useZustandStore } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import {
    EntityFormState,
    FormStatus,
    useFormStateStore_status,
} from 'stores/FormState';

interface Props {
    formStateStoreName: FormStateStoreNames;
}

function Status({ formStateStoreName }: Props) {
    const formStatus = useFormStateStore_status();

    const isActive = useZustandStore<
        EntityFormState,
        EntityFormState['isActive']
    >(formStateStoreName, (state) => state.isActive);

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
