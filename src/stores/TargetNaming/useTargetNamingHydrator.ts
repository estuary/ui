import { useEffect, useRef } from 'react';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useEntityWorkflow } from 'src/context/Workflow';
import { useBinding_sourceCaptureFlags } from 'src/stores/Binding/hooks';
import { detectTargetNamingModel } from 'src/stores/TargetNaming/shared';
import {
    useTargetNaming_setModel,
    useTargetNaming_setStrategy,
} from 'src/stores/TargetNaming/hooks';

// Detects which targetNaming model the spec uses and seeds the TargetNamingStore.
// Must be called from a component that renders after the binding store has hydrated
// (so that sourceCaptureTargetSchemaSupported is reliable) and after draft specs load.
//
// Create: always rootTargetNaming, strategy = null (user must choose via dialog)
// Edit:   detect from spec; read existing value if present
export function useTargetNamingHydrator() {
    const workflow = useEntityWorkflow();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const { sourceCaptureTargetSchemaSupported } =
        useBinding_sourceCaptureFlags();

    const setModel = useTargetNaming_setModel();
    const setStrategy = useTargetNaming_setStrategy();

    // Only hydrate once per workflow session (store reset handles cleanup).
    const hydrated = useRef(false);

    useEffect(() => {
        if (hydrated.current) return;

        // Create: always rootTargetNaming regardless of connector support
        if (workflow === 'materialization_create') {
            setModel('rootTargetNaming');
            // strategy stays null — user must pick via dialog before adding bindings
            hydrated.current = true;
            return;
        }

        // Edit: only hydrate if connector supports x_schema_name
        if (!sourceCaptureTargetSchemaSupported) return;

        // Edit: wait until draft spec is loaded
        if (!draftSpecs || draftSpecs.length === 0 || !draftSpecs[0].spec) {
            return;
        }

        const spec = draftSpecs[0].spec;
        const model = detectTargetNamingModel(spec);
        setModel(model);

        if (model === 'rootTargetNaming') {
            // Read existing root targetNaming value if present
            setStrategy(spec.targetNaming ?? null);
        }
        // For sourceTargetNaming: the old string value is handled by SourceCaptureStore
        // via the existing useSourceSetting('targetNaming') path — no change needed.

        hydrated.current = true;
    }, [
        draftSpecs,
        setModel,
        setStrategy,
        sourceCaptureTargetSchemaSupported,
        workflow,
    ]);
}
