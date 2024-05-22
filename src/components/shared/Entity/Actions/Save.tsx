import { Button } from '@mui/material';

import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/types';

import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import useEntityWorkflowHelpers from '../hooks/useEntityWorkflowHelpers';
import useSave from './useSave';

interface Props {
    disabled: boolean;
    logEvent: CustomEvents;
    onFailure: Function;
    buttonLabelId?: string;
    dryRun?: boolean;
}

function EntityCreateSave({
    buttonLabelId,
    disabled,
    dryRun,
    logEvent,
    onFailure,
}: Props) {
    const { closeLogs } = useEntityWorkflowHelpers();
    const save = useSave(logEvent, onFailure, dryRun);
    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();
    const draftId = useEditorStore_id();
    const formStatus = useFormStateStore_status();
    const entitySaved = formStatus === FormStatus.SAVED;

    return (
        <Button
            onClick={async (event) => {
                event.preventDefault();
                if (entitySaved) {
                    closeLogs();
                } else {
                    await save(draftId);
                }
            }}
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
        >
            <FormattedMessage
                id={
                    entitySaved
                        ? 'cta.goToDetails'
                        : buttonLabelId
                        ? buttonLabelId
                        : dryRun === true
                        ? 'cta.testConfig'
                        : 'cta.saveEntity'
                }
            />
        </Button>
    );
}

export default EntityCreateSave;
