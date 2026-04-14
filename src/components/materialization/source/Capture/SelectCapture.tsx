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
import { useWriteRootTargetNaming } from 'src/hooks/materialization/useWriteRootTargetNaming';
import { useBinding_sourceCaptureFlags } from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import {
    useTargetNaming_model,
    useTargetNaming_setStrategy,
    useTargetNaming_strategy,
} from 'src/stores/TargetNaming/hooks';
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
    const [namingDialogOpen, setNamingDialogOpen] = useState(false);

    const toggleDialog = (args: any) =>
        setOpen(typeof args === 'boolean' ? args : !open);

    const { sourceCaptureTargetSchemaSupported } =
        useBinding_sourceCaptureFlags();
    const targetNamingModel = useTargetNaming_model();
    const targetNamingStrategy = useTargetNaming_strategy();
    const setStrategy = useTargetNaming_setStrategy();
    const writeRootTargetNaming = useWriteRootTargetNaming();

    const needsNamingDialog =
        sourceCaptureTargetSchemaSupported &&
        targetNamingModel === 'rootTargetNaming' &&
        targetNamingStrategy === null;

    const handleModifyClick = () => {
        if (needsNamingDialog) {
            setNamingDialogOpen(true);
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
                    open={namingDialogOpen}
                    initialStrategy={targetNamingStrategy}
                    onCancel={() => setNamingDialogOpen(false)}
                    onConfirm={(strategy) => {
                        setStrategy(strategy);
                        writeRootTargetNaming(strategy);
                        setNamingDialogOpen(false);
                        toggleDialog(true);
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
