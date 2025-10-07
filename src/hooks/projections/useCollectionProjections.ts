import { useMemo } from 'react';

import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const useCollectionProjections = () => {
    const { collection } = useCollectionIndex();

    const projections = useWorkflowStore((state) => state.projections);

    return useMemo(() => {
        return collection && projections?.[collection]
            ? projections[collection]
            : {};
    }, [collection, projections]);
};
