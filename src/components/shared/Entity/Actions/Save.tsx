import { Button } from '@mui/material';

import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';

import useSave from './useSave';

interface Props {
    disabled: boolean;
    logEvent: CustomEvents;
    onFailure: Function;
    buttonLabelId?: string;
    dryRun?: boolean;
    forceLogsClosed?: boolean;
}

function EntityCreateSave({
    buttonLabelId,
    disabled,
    dryRun,
    forceLogsClosed,
    logEvent,
    onFailure,
}: Props) {
    const save = useSave(logEvent, onFailure, dryRun, forceLogsClosed);
    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();
    const draftId = useEditorStore_id();

    return (
        <Button
            onClick={async (event) => {
                event.preventDefault();
                await save(draftId);
            }}
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
        >
            <FormattedMessage
                id={
                    buttonLabelId
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
