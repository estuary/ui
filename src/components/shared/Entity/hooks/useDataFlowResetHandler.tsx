import { createPublication } from 'api/publications';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import { useCallback } from 'react';
import { useBindingStore } from 'stores/Binding/Store';
import { generateDisabledSpec } from 'utils/entity-utils';

function useDataFlowResetHandler() {
    const [backfillDataFlowTarget] = useBindingStore((state) => [
        state.backfillDataFlowTarget,
    ]);

    const draftId = useEditorStore_id();

    return useCallback(async () => {
        console.log('Starting');

        // Capture - Disable
        generateDisabledSpec({}, false, false);

        // Capture - Publish
        const publishResponse = await createPublication(draftId, false);
        if (publishResponse.error) {
            console.log('publishResponse.error', publishResponse.error);
            // return failed(publishResponse);
        }

        // waitForPublishToFinish(publishResponse.data[0].id, false);

        // Runtime must stop 100% and is done writing documents (wait for publication to succeed and then wait… or keep looking for shards)
        //      (IMPORTANT) - save current time
        // Bindings - update backfill property
        // Capture - enable
        // Materialization - update notBefore property
        // Capture & Materialization - Publish

        console.log('backfillDataFlowTarget', backfillDataFlowTarget);
    }, [backfillDataFlowTarget, draftId]);
}

export default useDataFlowResetHandler;
