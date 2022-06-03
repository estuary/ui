import { Typography } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

function Status() {
    const useEntityCreateStore = useRouteStore();

    const formStatus = useEntityCreateStore(
        entityCreateStoreSelectors.formState.status
    );

    const isActive = useEntityCreateStore(entityCreateStoreSelectors.isActive);

    let messageKey;
    if (formStatus === FormStatus.SUCCESS) {
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
