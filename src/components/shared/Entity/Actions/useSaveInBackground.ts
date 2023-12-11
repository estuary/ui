import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'components/editor/Store/hooks';
import { useEffect, useRef } from 'react';
import { CustomEvents } from 'services/types';
import useEntityWorkflowHelpers from '../hooks/useEntityWorkflowHelpers';
import useSave from './useSave';

// Probably can remove. Worked this directly into the field selection component
function useSaveInBackground() {
    const fireBackgroundTest = useRef(true);

    const { callFailed } = useEntityWorkflowHelpers();

    const draftId = useEditorStore_id();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const saveCatalog = useSave(
        CustomEvents.MATERIALIZATION_TEST_BACKGROUND,
        callFailed,
        true,
        true
    );

    useEffect(() => {
        if (
            fireBackgroundTest.current &&
            draftSpecs.length > 0 &&
            !draftSpecs[0].built_spec
        ) {
            fireBackgroundTest.current = false;
            void saveCatalog(draftId, true);
        }
    }, [draftId, draftSpecs, saveCatalog]);
}

export default useSaveInBackground;
