import { Button } from '@mui/material';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { useIntl } from 'react-intl';

import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { EntityCreateSaveButtonProps } from './types';
import useSave from './useSave';

function EntityCreateSave({
    buttonLabelId,
    disabled,
    dryRun,
    loading,
    logEvent,
    onFailure,
}: EntityCreateSaveButtonProps) {
    const intl = useIntl();

    const save = useSave(logEvent, onFailure, dryRun);

    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();
    const draftId = useEditorStore_id();

    // TODO (data flow reset)
    // const setShowPreSavePrompt = useFormStateStore_setShowPreSavePrompt();
    // const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);
    // const needsBackfilled = useBinding_backfilledBindings_count();

    return (
        <Button
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
            onClick={async () => {
                // TODO (data flow reset)
                // if (!dryRun && backfillDataflow && needsBackfilled) {
                //     setShowPreSavePrompt(true);
                // } else {
                //     await save(draftId);
                // }

                await save(draftId);
            }}
        >
            {intl.formatMessage({
                id: buttonLabelId
                    ? buttonLabelId
                    : dryRun === true
                    ? `cta.testConfig${loading ? '.active' : ''}`
                    : `cta.saveEntity${loading ? '.active' : ''}`,
            })}
        </Button>
    );
}

export default EntityCreateSave;
