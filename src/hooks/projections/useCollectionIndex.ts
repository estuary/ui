import { useMemo } from 'react';

import { useEditorStore_currentCatalog } from 'src/components/editor/Store/hooks';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';

export const useCollectionIndex = () => {
    const currentCollection = useBinding_currentCollection();
    const currentCatalog = useEditorStore_currentCatalog({ localScope: true });

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

    return { collection };
};
