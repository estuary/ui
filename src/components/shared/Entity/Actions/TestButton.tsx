import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/types';
import {
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
    useFormStateStore_showLogs,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import useEntityWorkflowHydrated from '../hooks/useEntityWorkflowHydrated';

interface Props {
    disabled: boolean;
    logEvent: CustomEvents.CAPTURE_TEST | CustomEvents.MATERIALIZATION_TEST;
}

function EntityTestButton({ disabled, logEvent }: Props) {
    const { callFailed, closeLogs } = useEntityWorkflowHelpers();
    const formsHydrated = useEntityWorkflowHydrated();

    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const showLogs = useFormStateStore_showLogs();
    const logToken = useFormStateStore_logToken();
    const formStatus = useFormStateStore_status();

    const testing = formStatus === FormStatus.TESTING;

    return (
        <>
            <LogDialog
                open={
                    testing || formStatus === FormStatus.TESTED
                        ? showLogs
                        : false
                }
                token={logToken}
                title={
                    <FormattedMessage
                        id={`${messagePrefix}.test.waitMessage`}
                    />
                }
                actionComponent={
                    <LogDialogActions
                        close={closeLogs}
                        closeCtaKey="cta.dismiss"
                    />
                }
            />
            <EntityCreateSave
                dryRun
                disabled={Boolean(disabled || !draftId) || !formsHydrated}
                onFailure={callFailed}
                loading={testing}
                logEvent={logEvent}
            />
        </>
    );
}

export default EntityTestButton;
