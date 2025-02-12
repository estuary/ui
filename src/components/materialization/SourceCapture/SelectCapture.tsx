import { Button } from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import AddDialog from 'components/shared/Entity/AddDialog';
import OptionalSettings from 'components/shared/Entity/AddDialog/OptionalSettings';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { isString } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useSourceCaptureStore_setSourceCaptureDefinition } from 'stores/SourceCapture/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import { getSourceCapture } from 'utils/entity-utils';
import { useShallow } from 'zustand/react/shallow';
import AddSourceCaptureToSpecButton from './AddSourceCaptureToSpecButton';
import CancelSourceCaptureButton from './CancelSourceCaptureButton';

const DIALOG_ID = 'add-source-capture-search-dialog';

function SelectCapture() {
    const formActive = useFormStateStore_isActive();
    const isEdit = useEntityWorkflow_Editing();
    const prefilledOnce = useRef(false);
    const defaultedOnce = useRef(false);

    const setSourceCaptureDefinition =
        useSourceCaptureStore_setSourceCaptureDefinition();

    const [sourceCapture, prefilledCapture] = useSourceCaptureStore(
        useShallow((state) => [state.sourceCapture, state.prefilledCapture])
    );

    const [open, setOpen] = useState<boolean>(false);
    const toggleDialog = (args: any) => {
        const opening = typeof args === 'boolean' ? args : !open;

        // On create default settings when going to set the
        //  source capture for the first time
        // Make sure we ONLY do this when OPENING
        if (!isEdit && !sourceCapture && opening) {
            setSourceCaptureDefinition({
                capture: '',
                deltaUpdates: false,
                targetSchema: 'fromSourceName',
            });
        }
        setOpen(opening);
    };

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const existingSourceCaptureDefinition = useMemo(
        () =>
            draftSpecs.length > 0
                ? getSourceCapture(draftSpecs[0].spec.sourceCapture)
                : null,
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

    // Put this in a memo - otherwise the disalog keeps rendering
    const selectedCollections = useMemo(
        () => (sourceCapture ? [sourceCapture] : []),
        [sourceCapture]
    );

    useEffect(() => {
        // First see if there is a value and then use the prefill if it exists. That way a user does not
        //  accidently override their existing setting without noticing
        if (
            !defaultedOnce.current &&
            isString(existingSourceCaptureDefinition?.capture)
        ) {
            setSourceCaptureDefinition(existingSourceCaptureDefinition);
            defaultedOnce.current = true;
        } else if (!prefilledOnce.current && prefilledExists) {
            if (
                prefilledCapture &&
                existingSourceCaptureDefinition?.capture !== prefilledCapture
            ) {
                setSourceCaptureDefinition({
                    capture: prefilledCapture,
                });
                prefilledOnce.current = true;
            }
        }
    }, [
        existingSourceCaptureDefinition,
        prefilledCapture,
        prefilledExists,
        setSourceCaptureDefinition,
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
                PrimaryCTA={AddSourceCaptureToSpecButton}
                SecondaryCTA={CancelSourceCaptureButton}
                selectedCollections={selectedCollections}
                toggle={toggleDialog}
                title={<FormattedMessage id="captureTable.header" />}
                OptionalSettings={OptionalSettings}
            />
        </>
    );
}

export default SelectCapture;
