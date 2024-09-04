import { Button } from '@mui/material';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import useSave from 'components/shared/Entity/Actions/useSave';
import DataflowResetModal from 'components/shared/Entity/DataflowResetModal';
import { buttonSx } from 'components/shared/Entity/Header';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/types';
import { useBindingStore } from 'stores/Binding/Store';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';

interface Props {
    disabled: boolean;
    loading: boolean;
    logEvent: CustomEvents;
    onFailure: Function;
    buttonLabelId?: string;
    dryRun?: boolean;
}

function SaveButton({
    buttonLabelId,
    disabled,
    dryRun,
    loading,
    logEvent,
    onFailure,
}: Props) {
    const [open, setOpen] = useState(false);

    const save = useSave(logEvent, onFailure, dryRun);
    const isSaving = useEditorStore_isSaving();
    const formActive = useFormStateStore_isActive();
    const draftId = useEditorStore_id();

    const [backfillDataflow] = useBindingStore((state) => [
        state.backfillDataFlow,
    ]);

    const labelId = buttonLabelId
        ? buttonLabelId
        : dryRun === true
        ? `cta.testConfig${loading ? '.active' : ''}`
        : `cta.saveEntity${loading ? '.active' : ''}`;

    return (
        <>
            <Button
                onClick={async () => {
                    if (!dryRun && backfillDataflow) {
                        console.log('Hey - we need a new modal here');
                        setOpen(true);
                        return;
                    }
                    await save(draftId);
                }}
                disabled={disabled || isSaving || formActive}
                sx={buttonSx}
            >
                <FormattedMessage id={labelId} />
            </Button>
            <DataflowResetModal open={open} setOpen={setOpen} />
        </>
    );
}

export default SaveButton;
