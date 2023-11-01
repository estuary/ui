import { Button } from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import AddDialog from 'components/shared/Entity/AddDialog';
import { useEntityWorkflow_Editing } from 'context/Workflow';
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
    const isEdit = useEntityWorkflow_Editing();

    const [sourceCapture, setSourceCapture, prefilledCapture] = useStore(
        invariableStores['source-capture'],
        (state) => [
            state.sourceCapture,
            state.setSourceCapture,
            state.prefilledCapture,
        ]
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

    // We only care about not used the prefilled capture if we're in edit.
    //  Otherwise we don't need to wait for the drafts to load and can just set the value.
    const prefilledExists = useMemo(
        () =>
            (isEdit && draftSpecs.length > 0 && isString(prefilledCapture)) ||
            (!isEdit && isString(prefilledCapture)),
        [draftSpecs.length, isEdit, prefilledCapture]
    );

    const showLoading = useMemo(
        () => isEdit && draftSpecs.length === 0,
        [draftSpecs, isEdit]
    );

    useEffect(() => {
        // First see if there is a value and then use the prefill if it exists. That way a user does not
        //  accidently override their existing setting without noticing
        if (settingsExist) {
            const sourceCaptureSetting = draftSpecs[0].spec.sourceCapture;
            if (sourceCapture !== sourceCaptureSetting) {
                setSourceCapture(sourceCaptureSetting);
            }
        } else if (prefilledExists) {
            if (sourceCapture !== prefilledCapture) {
                setSourceCapture(prefilledCapture);
            }
        }
    }, [
        draftSpecs,
        prefilledCapture,
        prefilledExists,
        setSourceCapture,
        settingsExist,
        sourceCapture,
    ]);

    return (
        <>
            <Button disabled={showLoading || formActive} onClick={toggleDialog}>
                <FormattedMessage
                    id={
                        showLoading
                            ? 'workflows.sourceCapture.cta.loading'
                            : sourceCapture
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
