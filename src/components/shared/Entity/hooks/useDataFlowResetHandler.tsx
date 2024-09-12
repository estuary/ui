import { useCallback } from 'react';
import { useBindingStore } from 'stores/Binding/Store';
import { generateDisabledSpec } from 'utils/entity-utils';

function useDataFlowResetHandler() {
    const [backfillDataFlowTarget] = useBindingStore((state) => [
        state.backfillDataFlowTarget,
    ]);

    return useCallback(() => {
        console.log('Starting');

        // Capture - Disable

        generateDisabledSpec({}, false, false);

        // Capture - Publish
        // Runtime must stop 100% and is done writing documents (wait for publication to succeed and then wait… or keep looking for shards)
        //      (IMPORTANT) - save current time
        // Bindings - update backfill property
        // Capture - enable
        // Materialization - update notBefore property
        // Capture & Materialization - Publish

        console.log('backfillDataFlowTarget', backfillDataFlowTarget);
    }, [backfillDataFlowTarget]);
}

export default useDataFlowResetHandler;
