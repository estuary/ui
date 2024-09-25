import { Button } from '@mui/material';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { useIntl } from 'react-intl';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_setShowSavePrompt,
} from 'stores/FormState/hooks';
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
    const draftId = useEditorStore_id();

    const formActive = useFormStateStore_isActive();

    // TODO (data flow reset)
    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();
    const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);
    const needsBackfilled = useBinding_backfilledBindings_count();

    return (
        <Button
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
            onClick={async () => {
                // TODO (data flow reset)
                if (!dryRun && backfillDataflow && needsBackfilled) {
                    setShowSavePrompt(true);
                } else {
                    await save(draftId);
                }

                // await save(draftId);
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
