import { FormattedMessage } from 'react-intl';
import {
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
    useFormStateStore_showLogs,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useWorkflowStore } from 'stores/Workflow/Store';
import useEntityWorkflowHelpers from './hooks/useEntityWorkflowHelpers';
import LogDialog from './LogDialog';
import LogDialogActions from './LogDialogActions';

function HeaderLogs() {
    const { closeLogs } = useEntityWorkflowHelpers();

    const messagePrefix = useFormStateStore_messagePrefix();
    const showLogs = useFormStateStore_showLogs();
    const logToken = useFormStateStore_logToken();
    const formStatus = useFormStateStore_status();

    const redirectUrl = useWorkflowStore((state) => state.redirectUrl);

    const testAction =
        formStatus === FormStatus.TESTED || formStatus === FormStatus.TESTING;

    const saveAction =
        formStatus === FormStatus.SAVED || formStatus === FormStatus.SAVING;

    const externalRedirect = Boolean(saveAction && redirectUrl);

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
            actionComponent={
                <LogDialogActions
                    close={() =>
                        closeLogs(
                            externalRedirect ? redirectUrl : undefined,
                            externalRedirect
                        )
                    }
                    closeCtaKey={externalRedirect ? 'cta.exit' : undefined}
                />
            }
        />
    );
}

export default HeaderLogs;
