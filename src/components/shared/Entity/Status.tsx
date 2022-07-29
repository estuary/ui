import { Typography } from '@mui/material';
import { DetailsFormStoreNames, useZustandStore } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { CreateState, FormStatus } from 'stores/MiniCreate';

interface Props {
    detailsFormStoreName: DetailsFormStoreNames;
}

function Status({ detailsFormStoreName }: Props) {
    const formStatus = useZustandStore<
        CreateState,
        CreateState['formState']['status']
    >(detailsFormStoreName, (state) => state.formState.status);

    const isActive = useZustandStore<CreateState, CreateState['isActive']>(
        detailsFormStoreName,
        (state) => state.isActive
    );

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
