import { useMemo } from 'react';

import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const useProjectedFields = (
    collection: string | undefined,
    pointer: string | undefined
) => {
    const projections = useWorkflowStore((state) => state.projections);

    const projectedFields = useMemo(
        () =>
            pointer && collection && projections?.[collection]
                ? Object.entries(projections[collection])
                      .filter(([location, _metadata]) => location === pointer)
                      .flatMap(([_location, metadata]) => metadata)
                : [],
        [collection, pointer, projections]
    );

    return { projectedFields };
};
