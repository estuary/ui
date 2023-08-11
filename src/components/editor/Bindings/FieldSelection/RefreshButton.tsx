import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useEffect } from 'react';
import { CustomEvents } from 'services/logrocket';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

interface Props {
    disabled: boolean;
    logEvent: CustomEvents.MATERIALIZATION_TEST;
    buttonLabelId: string;
    forceLogsClosed?: boolean;
}

function RefreshButton({
    disabled,
    logEvent,
    buttonLabelId,
    forceLogsClosed,
}: Props) {
    const { callFailed, closeLogs } = useEntityWorkflowHelpers();

    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const formStatus = useFormStateStore_status();

    useEffect(() => {
        if (forceLogsClosed && formStatus === FormStatus.TESTED) {
            closeLogs();
        }
    }, [closeLogs, formStatus, forceLogsClosed]);

    return (
        <EntityCreateSave
            dryRun
            disabled={disabled || !draftId}
            onFailure={callFailed}
            logEvent={logEvent}
            buttonLabelId={buttonLabelId}
        />
    );
}
export default RefreshButton;
