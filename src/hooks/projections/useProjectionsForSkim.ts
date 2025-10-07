import { useMemo } from 'react';

import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

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
