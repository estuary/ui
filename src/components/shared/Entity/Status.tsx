import { Alert, AlertColor, Typography } from '@mui/material';
import { FormStateStoreNames, useZustandStore } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { EntityFormState, FormStatus } from 'stores/FormState';

interface Props {
    formStateStoreName: FormStateStoreNames;
}

function Status({ formStateStoreName }: Props) {
    const formStatus = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['status']
    >(formStateStoreName, (state) => state.formState.status);

    const isActive = useZustandStore<
        EntityFormState,
        EntityFormState['isActive']
    >(formStateStoreName, (state) => state.isActive);

    let severity: AlertColor | undefined, messageKey;
    if (formStatus === FormStatus.TESTED || formStatus === FormStatus.SAVED) {
        messageKey = 'common.success';
        severity = 'success';
    } else if (formStatus === FormStatus.FAILED) {
        messageKey = 'common.fail';
        severity = 'error';
    } else if (isActive) {
        messageKey = 'common.running';
        severity = 'info';
    }

    console.log('rendering the status');

    if (messageKey) {
        return (
            <Alert severity={severity}>
                <Typography sx={{ mr: 1 }}>
                    <FormattedMessage id={messageKey} />
                </Typography>
            </Alert>
        );
    } else {
        return null;
    }
}

export default Status;
