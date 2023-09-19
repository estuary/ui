import { Button } from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import AddDialog from 'components/shared/Entity/AddDialog';
import invariableStores from 'context/Zustand/invariableStores';
import { isString } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useStore } from 'zustand';
import AddSourceCaptureToSpecButton from './AddSourceCaptureToSpecButton';

const DIALOG_ID = 'add-source-capture-search-dialog';

function SelectCapture() {
    const formActive = useFormStateStore_isActive();

    const [sourceCapture, setSourceCapture] = useStore(
        invariableStores['source-capture'],
        (state) => [state.sourceCapture, state.setSourceCapture]
    );

    const [open, setOpen] = useState<boolean>(false);

    const toggleDialog = (args: any) => {
        setOpen(typeof args === 'boolean' ? args : !open);
    };

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const settingsExist = useMemo(
        () =>
            draftSpecs.length > 0 && isString(draftSpecs[0].spec.sourceCapture),
        [draftSpecs]
    );

    useEffect(() => {
        if (settingsExist) {
            const sourceCaptureSetting = draftSpecs[0].spec.sourceCapture;
            if (sourceCapture !== sourceCaptureSetting) {
                console.log('sourceCaptureSetting', sourceCaptureSetting);
                setSourceCapture(sourceCaptureSetting);
            }
        }
    }, [draftSpecs, setSourceCapture, settingsExist, sourceCapture]);

    return (
        <>
            <Button disabled={formActive} onClick={toggleDialog}>
                <FormattedMessage
                    id={
                        sourceCapture
                            ? 'workflows.sourceCapture.cta.edit'
                            : 'workflows.sourceCapture.cta'
                    }
                />
            </Button>
            <AddDialog
                entity="capture"
                id={DIALOG_ID}
                open={open}
                primaryCTA={AddSourceCaptureToSpecButton}
                selectedCollections={sourceCapture ? [sourceCapture] : []}
                toggle={toggleDialog}
                title={<FormattedMessage id="captureTable.header" />}
            />
        </>
    );
}

export default SelectCapture;
