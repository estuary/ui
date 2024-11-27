import { Button } from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import AddDialog from 'components/shared/Entity/AddDialog';
import OptionalSettings from 'components/shared/Entity/AddDialog/OptionalSettings';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { isString } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useSourceCaptureStore_SourceCaptureDefinition } from 'stores/SourceCapture/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import { getSourceCapture, hasSourceCaptureChanged } from 'utils/entity-utils';
import AddSourceCaptureToSpecButton from './AddSourceCaptureToSpecButton';
import CancelSourceCaptureButton from './CancelSourceCaptureButton';

const DIALOG_ID = 'add-source-capture-search-dialog';

function SelectCapture() {
    const formActive = useFormStateStore_isActive();
    const isEdit = useEntityWorkflow_Editing();
    const prefilledOnce = useRef(false);

    const [open, setOpen] = useState<boolean>(false);
    const toggleDialog = (args: any) => {
        setOpen(typeof args === 'boolean' ? args : !open);
    };

    const sourceCaptureDefinition =
        useSourceCaptureStore_SourceCaptureDefinition();

    const [
        setSourceCapture,
        setDeltaUpdates,
        setTargetSchema,
        prefilledCapture,
    ] = useSourceCaptureStore((state) => [
        state.setSourceCapture,
        state.setDeltaUpdates,
        state.setTargetSchema,
        state.prefilledCapture,
    ]);

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

    useEffect(() => {
        // First see if there is a value and then use the prefill if it exists. That way a user does not
        //  accidently override their existing setting without noticing
        if (isString(existingSourceCaptureDefinition?.capture)) {
            if (
                existingSourceCaptureDefinition &&
                hasSourceCaptureChanged(
                    sourceCaptureDefinition,
                    existingSourceCaptureDefinition
                )
            ) {
                setSourceCapture(existingSourceCaptureDefinition.capture);

                // This is for when a user is editing their current sourceCapture that is just a plain string.
                //  We do not want to flip their settings to something they are not expecting. So let the
                //  components default as they are prepared to do.
                if (existingSourceCaptureDefinition.deltaUpdates) {
                    setDeltaUpdates(
                        existingSourceCaptureDefinition.deltaUpdates
                    );
                }

                if (existingSourceCaptureDefinition.targetSchema) {
                    setTargetSchema(
                        existingSourceCaptureDefinition.targetSchema
                    );
                }
            }
        } else if (!prefilledOnce.current && prefilledExists) {
            if (sourceCaptureDefinition.capture !== prefilledCapture) {
                setSourceCapture(prefilledCapture);
                prefilledOnce.current = true;
            }
        }
    }, [
        existingSourceCaptureDefinition,
        prefilledCapture,
        prefilledExists,
        setDeltaUpdates,
        setSourceCapture,
        setTargetSchema,
        sourceCaptureDefinition,
    ]);

    return (
        <>
            <Button disabled={showLoading || formActive} onClick={toggleDialog}>
                <FormattedMessage
                    id={
                        showLoading
                            ? 'workflows.sourceCapture.cta.loading'
                            : sourceCaptureDefinition.capture
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
                selectedCollections={
                    sourceCaptureDefinition.capture
                        ? [sourceCaptureDefinition.capture]
                        : []
                }
                toggle={toggleDialog}
                title={<FormattedMessage id="captureTable.header" />}
                optionalSettings={<OptionalSettings />}
            />
        </>
    );
}

export default SelectCapture;
