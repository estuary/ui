import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { isString } from 'lodash';
import { useIntl } from 'react-intl';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import AddSourceCaptureToSpecButton from 'src/components/materialization/source/Capture/AddSourceCaptureToSpecButton';
import DestinationLayoutDialog from 'src/components/materialization/targetNaming/Dialog';
import AddDialog from 'src/components/shared/Entity/AddDialog';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { readSourceCaptureDefinitionFromSpec } from 'src/utils/entity-utils';

const DIALOG_ID = 'add-source-capture-search-dialog';

function SelectCapture() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();
    const isEdit = useEntityWorkflow_Editing();
    const prefilledOnce = useRef(false);
    const defaultedOnce = useRef(false);

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const [sourceCapture, prefilledCapture, setSourceCapture] =
        useSourceCaptureStore(
            useShallow((state) => [
                state.sourceCapture,
                state.prefilledCapture,
                state.setSourceCapture,
            ])
        );

    const [open, setOpen] = useState<boolean>(false);

    const toggleDialog = (args: any) =>
        setOpen(typeof args === 'boolean' ? args : !open);

    const {
        strategy: targetNamingStrategy,
        needsNamingDialog,
        updateStrategy,
        dialogOpen: namingDialogOpen,
        openDialog: openNamingDialog,
        closeDialog: closeNamingDialog,
    } = useTargetNaming();

    const handleModifyClick = () => {
        if (needsNamingDialog) {
            openNamingDialog();
        } else {
            toggleDialog(true);
        }
    };

    const existingSourceCaptureDefinition = useMemo(
        () =>
            draftSpecs.length > 0
                ? readSourceCaptureDefinitionFromSpec(draftSpecs[0].spec)
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
            setSourceCapture(existingSourceCaptureDefinition?.capture);
            defaultedOnce.current = true;
        } else if (!prefilledOnce.current && prefilledExists) {
            if (
                prefilledCapture &&
                existingSourceCaptureDefinition?.capture !== prefilledCapture
            ) {
                setSourceCapture(prefilledCapture);
                prefilledOnce.current = true;
            }
        }
    }, [
        existingSourceCaptureDefinition?.capture,
        prefilledCapture,
        prefilledExists,
        setSourceCapture,
    ]);

    return (
        <>
            <Button
                disabled={showLoading || formActive}
                onClick={handleModifyClick}
            >
                {intl.formatMessage({
                    id: showLoading
                        ? 'workflows.sourceCapture.cta.loading'
                        : 'cta.modify',
                })}
            </Button>

            {namingDialogOpen ? (
                <DestinationLayoutDialog
                    confirmIntlKey="destinationLayout.dialog.cta.sourceCapture"
                    open={namingDialogOpen}
                    initialStrategy={targetNamingStrategy}
                    onCancel={closeNamingDialog}
                    onConfirm={(strategy) => {
                        updateStrategy(strategy).then(() => {
                            closeNamingDialog();
                            toggleDialog(true);
                        });
                    }}
                />
            ) : null}

            <AddDialog
                entity="capture"
                id={DIALOG_ID}
                open={open}
                PrimaryCTA={AddSourceCaptureToSpecButton}
                selectedCollections={selectedCollections}
                toggle={toggleDialog}
                title={intl.formatMessage({ id: 'captureTable.header' })}
            />
        </>
    );
}

export default SelectCapture;
