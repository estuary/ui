import { Button } from '@mui/material';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { FormattedMessage } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';

import {
    useFormStateStore_isActive,
    useFormStateStore_setShowInterstitialSave,
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
    const save = useSave(logEvent, onFailure, dryRun);

    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();
    const draftId = useEditorStore_id();

    const setShowInterstitialSave = useFormStateStore_setShowInterstitialSave();

    const [backfillDataflow] = useBindingStore((state) => [
        state.backfillDataFlow,
    ]);

    const labelId = buttonLabelId
        ? buttonLabelId
        : dryRun === true
        ? `cta.testConfig${loading ? '.active' : ''}`
        : `cta.saveEntity${loading ? '.active' : ''}`;

    return (
        <Button
            onClick={async () => {
                if (!dryRun && backfillDataflow) {
                    setShowInterstitialSave(true);
                    return;
                }
                await save(draftId);
            }}
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
        >
            <FormattedMessage id={labelId} />
        </Button>
    );
}

export default EntityCreateSave;
