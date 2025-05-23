import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { isString } from 'lodash';
import { useIntl } from 'react-intl';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import AddSourceCaptureToSpecButton from 'src/components/materialization/SourceCapture/AddSourceCaptureToSpecButton';
import CancelSourceCaptureButton from 'src/components/materialization/SourceCapture/CancelSourceCaptureButton';
import AddDialog from 'src/components/shared/Entity/AddDialog';
import OptionalSettings from 'src/components/shared/Entity/AddDialog/OptionalSettings';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore_setSourceCaptureDefinition } from 'src/stores/SourceCapture/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { getSourceCapture } from 'src/utils/entity-utils';

const DIALOG_ID = 'add-source-capture-search-dialog';

function SelectCapture() {
    const intl = useIntl();
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
                {intl.formatMessage({
                    id: showLoading
                        ? 'workflows.sourceCapture.cta.loading'
                        : 'cta.modify',
                })}
            </Button>
            <AddDialog
                entity="capture"
                id={DIALOG_ID}
                open={open}
                PrimaryCTA={AddSourceCaptureToSpecButton}
                SecondaryCTA={CancelSourceCaptureButton}
                selectedCollections={selectedCollections}
                toggle={toggleDialog}
                title={intl.formatMessage({ id: 'captureTable.header' })}
                OptionalSettings={OptionalSettings}
            />
        </>
    );
}

export default SelectCapture;
