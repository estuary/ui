import { Button } from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import AddDialog from 'components/shared/Entity/AddDialog';
import OptionalSettings from 'components/shared/Entity/AddDialog/OptionalSettings';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { isString } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import {
    useSourceCaptureStore_setSourceCaptureDefinition,
    useSourceCaptureStore_sourceCaptureDefinition,
} from 'stores/SourceCapture/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import { getSourceCapture } from 'utils/entity-utils';
import AddSourceCaptureToSpecButton from './AddSourceCaptureToSpecButton';
import CancelSourceCaptureButton from './CancelSourceCaptureButton';

const DIALOG_ID = 'add-source-capture-search-dialog';

function SelectCapture() {
    const formActive = useFormStateStore_isActive();
    const isEdit = useEntityWorkflow_Editing();
    const prefilledOnce = useRef(false);
    const defaultedOnce = useRef(false);

    const sourceCaptureDefinition =
        useSourceCaptureStore_sourceCaptureDefinition();
    const setSourceCaptureDefinition =
        useSourceCaptureStore_setSourceCaptureDefinition();

    const [prefilledCapture] = useSourceCaptureStore((state) => [
        state.prefilledCapture,
    ]);

    const [open, setOpen] = useState<boolean>(false);
    const toggleDialog = (args: any) => {
        // On create default settings when going to set the
        //  source capture for the first time
        if (!isEdit && !sourceCaptureDefinition) {
            setSourceCaptureDefinition({
                capture: '',
                deltaUpdates: false,
                targetSchema: 'fromSourceName',
            });
        }
        setOpen(typeof args === 'boolean' ? args : !open);
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

    // TODO (source capture optional settings)
    // Need to handle checking isEdit in here so we don't set the optional
    //  settings incorrectly
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
                            : sourceCaptureDefinition?.capture
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
                    sourceCaptureDefinition?.capture
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
