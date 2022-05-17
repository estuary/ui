import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { createStoreSelectors, FormStatus } from 'stores/Create';

function Status() {
    const entityCreateStore = useRouteStore();

    const formStatus = entityCreateStore(createStoreSelectors.formState.status);

    let messageKey;
    if (formStatus === FormStatus.SUCCESS) {
        messageKey = 'common.success';
    } else if (formStatus === FormStatus.FAILED) {
        messageKey = 'common.fail';
    } else if (formStatus !== FormStatus.IDLE) {
        messageKey = 'common.running';
    }

    if (messageKey) {
        return <FormattedMessage id={messageKey} />;
    } else {
        return null;
    }
}

export default Status;
