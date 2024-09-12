import { Button } from '@mui/material';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { FormattedMessage } from 'react-intl';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';

import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import useDataFlowResetHandler from '../hooks/useDataFlowResetHandler';
import useDataFlowResetPrompt from '../hooks/useDataFlowResetPrompt';
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
    const save = useSave(logEvent, onFailure, dryRun);

    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();
    const draftId = useEditorStore_id();

    const showDataFlowResetPrompt = useDataFlowResetPrompt();
    const handler = useDataFlowResetHandler();

    const [backfillDataflow] = useBindingStore((state) => [
        state.backfillDataFlow,
    ]);
    const needsBackfilled = useBinding_backfilledBindings_count();

    const labelId = buttonLabelId
        ? buttonLabelId
        : dryRun === true
        ? `cta.testConfig${loading ? '.active' : ''}`
        : `cta.saveEntity${loading ? '.active' : ''}`;

    return (
        <Button
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
            onClick={async () => {
                // TODO (reset dataflow)
                if (!dryRun && backfillDataflow && needsBackfilled) {
                    showDataFlowResetPrompt((data) => {
                        if (data) {
                            console.log('YES');
                            handler();
                        } else {
                            console.log('NO');
                        }
                    });
                    return;
                }
                await save(draftId);
            }}
        >
            <FormattedMessage id={labelId} />
        </Button>
    );
}

export default EntityCreateSave;
