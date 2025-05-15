import { useMemo } from 'react';

import { useEditorStore_currentCatalog } from 'src/components/editor/Store/hooks';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const useProjectedFields = (pointer: string | undefined) => {
    const currentCollection = useBinding_currentCollection();
    const currentCatalog = useEditorStore_currentCatalog();
    const projections = useWorkflowStore((state) => state.projections);

    const collection = useMemo(() => {
        if (currentCollection) {
            return currentCollection;
        }

        return currentCatalog?.spec_type === 'collection'
            ? currentCatalog?.catalog_name
            : undefined;
    }, [
        currentCollection,
        currentCatalog?.catalog_name,
        currentCatalog?.spec_type,
    ]);

    const projectedFields = useMemo(
        () =>
            pointer && collection && projections?.[collection]
                ? Object.entries(projections[collection])
                      .filter(([location, _metadata]) => location === pointer)
                      .flatMap(([_location, metadata]) => metadata)
                      .reverse()
                : [],
        [collection, pointer, projections]
    );

    return { collection, projectedFields };
};
