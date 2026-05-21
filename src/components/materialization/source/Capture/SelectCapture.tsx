import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { isString } from 'lodash';
import { useIntl } from 'react-intl';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import AddSourceCaptureToSpecButton from 'src/components/materialization/source/Capture/AddSourceCaptureToSpecButton';
import AddDialog from 'src/components/shared/Entity/AddDialog';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { readSourceCaptureDefinitionFromSpec } from 'src/utils/entity-utils';

const DIALOG_ID = 'add-source-capture-search-dialog';

function SelectCapture() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();
    const isEdit = useEntityWorkflow_Editing();
    const defaultedOnce = useRef(false);

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const [sourceCapture, setSourceCapture] = useSourceCaptureStore(
        useShallow((state) => [state.sourceCapture, state.setSourceCapture])
    );

    const [open, setOpen] = useState<boolean>(false);

    const toggleDialog = (args: any) =>
        setOpen(typeof args === 'boolean' ? args : !open);

    const handleModifyClick = () => {
        toggleDialog(true);
    };

    const existingSourceCaptureDefinition = useMemo(
        () =>
            draftSpecs.length > 0
                ? readSourceCaptureDefinitionFromSpec(draftSpecs[0].spec)
                : null,
        [draftSpecs]
    );

    const showLoading = useMemo(
        () => isEdit && draftSpecs.length === 0,
        [draftSpecs, isEdit]
    );

    // Put this in a memo - otherwise the dialog keeps rendering
    const selectedCollections = useMemo(
        () => (sourceCapture ? [sourceCapture] : []),
        [sourceCapture]
    );

    useEffect(() => {
        // Hydrate the sourceCapture from the draft one time
        if (
            !defaultedOnce.current &&
            isString(existingSourceCaptureDefinition?.capture)
        ) {
            setSourceCapture(existingSourceCaptureDefinition?.capture);
            defaultedOnce.current = true;
        }
    }, [existingSourceCaptureDefinition?.capture, setSourceCapture]);

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
