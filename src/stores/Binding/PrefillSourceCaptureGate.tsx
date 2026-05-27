import type { ReactNode } from 'react';
import type { LiveSpecsExt_MaterializeOrTransform } from 'src/hooks/useLiveSpecsExt';
import type { TargetNamingStrategy } from 'src/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import TargetNamingDialog from 'src/components/materialization/targetNaming/Dialog';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import useApplyCollectionSelections from 'src/hooks/materialization/useApplyCollectionSelections';
import { useBinding_sourceCaptureFlags } from 'src/stores/Binding/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { useTargetNaming_setStrategy } from 'src/stores/TargetNaming/hooks';

interface Props {
    response: LiveSpecsExt_MaterializeOrTransform[] | null;
    children: ReactNode;
}

// Renders after BindingHydrator completes so that useBinding_sourceCaptureFlags
// reflects the hydrated resourceConfigPointers. Gates children behind
// TargetNamingDialog when the connector supports x_schema_name and there is a
// prefill response to act on.
export function PrefillSourceCaptureGate({ response, children }: Props) {
    const editWorkflow = useEntityWorkflow_Editing();
    const { sourceCaptureTargetSchemaSupported } =
        useBinding_sourceCaptureFlags();

    const setSourceCapture = useSourceCaptureStore(
        (state) => state.setSourceCapture
    );
    const setStrategy = useTargetNaming_setStrategy();
    const applyCollectionSelections = useApplyCollectionSelections();

    const [dialogHandled, setDialogHandled] = useState(false);

    // readyToPrefill: true when there is something to act on
    // prefilledCaptureName: use to set sourceCapture
    // collectionItems: either writes_to or the list of collections provided
    const { readyToPrefill, prefilledCaptureName, collectionItems } =
        useMemo(() => {
            if (editWorkflow || !response || response.length === 0) {
                return {
                    readyToPrefill: false,
                    prefilledCaptureName: undefined,
                    collectionItems: [],
                };
            }

            return {
                readyToPrefill: true,
                prefilledCaptureName:
                    response[0]?.spec_type === 'capture'
                        ? response[0].catalog_name
                        : undefined,
                collectionItems: response.flatMap((item) =>
                    item.spec_type === 'capture'
                        ? (item.writes_to ?? []).map((name) => ({
                              catalog_name: name,
                          }))
                        : [item]
                ),
            };
        }, [editWorkflow, response]);

    // Bypass path: connector doesn't support x_schema_name so no dialog is shown,
    // but we still need to populate the source capture and bindings.
    const bypassRan = useRef(false);
    useEffect(() => {
        if (bypassRan.current) {
            return;
        }

        if (readyToPrefill && !sourceCaptureTargetSchemaSupported) {
            bypassRan.current = true;
            if (prefilledCaptureName) {
                setSourceCapture(prefilledCaptureName);
            }
            applyCollectionSelections(
                null,
                collectionItems,
                prefilledCaptureName
            );
        }
    }, [
        applyCollectionSelections,
        collectionItems,
        prefilledCaptureName,
        readyToPrefill,
        setSourceCapture,
        sourceCaptureTargetSchemaSupported,
    ]);

    const handleConfirm = (strategy: TargetNamingStrategy) => {
        // Make sure this is done right away so the prefill stuff below has it
        setStrategy(strategy);

        // TODO (source capture : multiple) - we'll need to handle a list of these one day
        if (prefilledCaptureName) {
            setSourceCapture(prefilledCaptureName);
        }

        applyCollectionSelections(
            strategy,
            collectionItems,
            prefilledCaptureName
        );
        setDialogHandled(true);
    };

    return (
        <>
            {children}
            {!dialogHandled &&
            readyToPrefill &&
            sourceCaptureTargetSchemaSupported ? (
                <TargetNamingDialog
                    alertIntlKey="destinationLayout.dialog.alert"
                    confirmIntlKey="cta.continue"
                    open={true}
                    // This will DROP all the prefilling on purpose. The user has to provide the settings
                    //  to get the prefill to work.
                    onCancel={() => setDialogHandled(true)}
                    onConfirm={handleConfirm}
                />
            ) : null}
        </>
    );
}
