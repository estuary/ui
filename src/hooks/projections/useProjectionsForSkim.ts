import { useMemo } from 'react';

import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

// Very minor difference between this and useProjectedFields as `skim_collection_projections`
//  wants the `projections` to look like they do in the CollectionDef.
// Eventually we'll probably want to merge these - but having two hooks helped reduce complexity
export const useProjectionsForSkim = () => {
    const { collection } = useCollectionIndex();

    const projections = useWorkflowStore((state) => state.projections);

    return useMemo(() => {
        if (collection && projections?.[collection]) {
            const response = {};
            Object.values(projections[collection]).forEach((metadata) => {
                metadata.forEach((datum) => {
                    response[datum.field] ??= {};
                    response[datum.field] = datum.location;
                });
            });
            return response;
        }

        return {};
    }, [collection, projections]);
};
