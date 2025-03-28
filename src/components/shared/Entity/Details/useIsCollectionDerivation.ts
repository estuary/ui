import { useEditorStore_currentCatalog } from 'src/components/editor/Store/hooks';
import { useMemo } from 'react';
import { specContainsDerivation } from 'src/utils/misc-utils';

function useIsCollectionDerivation() {
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogSpec = currentCatalog?.spec ?? null;
    const { isDerivation } = specContainsDerivation(catalogSpec);

    return useMemo(() => isDerivation, [isDerivation]);
}

export default useIsCollectionDerivation;
