import { FormattedMessage } from 'react-intl';

import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import LogDialog from 'src/components/shared/Entity/LogDialog';
import LogDialogActions from 'src/components/shared/Entity/LogDialogActions';
import {
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
    useFormStateStore_showLogs,
    useFormStateStore_status,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

function HeaderLogs() {
    const { closeLogs } = useEntityWorkflowHelpers();

    const messagePrefix = useFormStateStore_messagePrefix();
    const showLogs = useFormStateStore_showLogs();
    const logToken = useFormStateStore_logToken();
    const formStatus = useFormStateStore_status();

    const testAction =
        formStatus === FormStatus.TESTED || formStatus === FormStatus.TESTING;

    const saveAction =
        formStatus === FormStatus.SAVED || formStatus === FormStatus.SAVING;

    return (
        <LogDialog
            open={testAction || saveAction ? showLogs : false}
            token={logToken}
            title={
                <FormattedMessage
                    id={`${messagePrefix}.${
                        testAction ? 'test' : 'save'
                    }.waitMessage`}
                />
            }
            actionComponent={<LogDialogActions close={closeLogs} />}
        />
    );
}

export default HeaderLogs;
