import { FormattedMessage } from 'react-intl';

import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';

import { CustomEvents } from 'services/logrocket';

import {
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
    useFormStateStore_showLogs,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

interface Props {
    closeLogs: Function;
    callFailed: Function;
    disabled: boolean;
    logEvent: CustomEvents.CAPTURE_TEST | CustomEvents.MATERIALIZATION_TEST;
}

function EntityTestButton({
    callFailed,
    closeLogs,
    disabled,
    logEvent,
}: Props) {
    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const showLogs = useFormStateStore_showLogs();
    const logToken = useFormStateStore_logToken();

    const formStatus = useFormStateStore_status();

    return (
        <>
            <LogDialog
                open={
                    formStatus === FormStatus.TESTING ||
                    formStatus === FormStatus.TESTED
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
                disabled={disabled || !draftId}
                onFailure={callFailed}
                logEvent={logEvent}
            />
        </>
    );
}

export default EntityTestButton;
