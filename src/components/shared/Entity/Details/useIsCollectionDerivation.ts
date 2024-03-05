import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import { useMemo } from 'react';
import { specContainsDerivation } from 'utils/misc-utils';

function useIsCollectionDerivation() {
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogSpec = currentCatalog?.spec ?? null;
    const { isDerivation } = specContainsDerivation(catalogSpec);

    return useMemo(() => isDerivation, [isDerivation]);
}

export default useIsCollectionDerivation;
