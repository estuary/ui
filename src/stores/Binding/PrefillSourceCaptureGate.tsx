import type { ReactNode } from 'react';
import type { LiveSpecsExt_MaterializeOrTransform } from 'src/hooks/useLiveSpecsExt';
import type { TargetNamingStrategy } from 'src/types';

import { useState } from 'react';

import TargetNamingDialog from 'src/components/materialization/targetNaming/Dialog';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';
import {
    useBinding_addEmptyBindings,
    useBinding_sourceCaptureFlags,
} from 'src/stores/Binding/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { useTargetNaming_setStrategy } from 'src/stores/TargetNaming/hooks';

interface Props {
    response: LiveSpecsExt_MaterializeOrTransform[] | null;
    children: ReactNode;
}

// Renders after BindingHydrator completes so that useBinding_sourceCaptureFlags
// reflects the hydrated resourceConfigPointers. Gates children behind
// TargetNamingDialog when the connector supports x_schema_name and there is a
// prefill response to act on. setPrefilledCapture only runs on confirm.
export function PrefillSourceCaptureGate({ response, children }: Props) {
    const editWorkflow = useEntityWorkflow_Editing();
    const { sourceCaptureTargetSchemaSupported } =
        useBinding_sourceCaptureFlags();

    const addEmptyBindings = useBinding_addEmptyBindings();
    const setPrefilledCapture = useSourceCaptureStore(
        (state) => state.setPrefilledCapture
    );
    const { handleConfirm: targetNamingHandleConfirm } = useTargetNaming();

    const setStrategy = useTargetNaming_setStrategy();

    const shouldShowDialog =
        !editWorkflow &&
        response !== null &&
        response.length > 0 &&
        sourceCaptureTargetSchemaSupported;

    const [dialogHandled, setDialogHandled] = useState(false);

    const handleConfirm = (strategy: TargetNamingStrategy) => {
        // Make sure this is done right away so the prefill stuff below has it
        setStrategy(strategy);

        if (response && response.length > 0) {
            // TODO (source capture : multiple) - we'll need to handle a list of these one day
            // Handle when we are materializing a sourceCapture.
            if (response[0].spec_type === 'capture') {
                setPrefilledCapture(response[0].catalog_name);
            }

            addEmptyBindings(response, false);
        }

        setDialogHandled(true);
    };

    return (
        <>
            {children}
            {!dialogHandled && shouldShowDialog ? (
                <TargetNamingDialog
                    confirmIntlKey="cta.continue"
                    open={true}
                    onCancel={() => setDialogHandled(true)}
                    onConfirm={handleConfirm}
                />
            ) : null}
        </>
    );
}
