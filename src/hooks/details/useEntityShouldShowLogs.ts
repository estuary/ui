import { useMemo } from 'react';

import { useEntityType } from 'src/context/EntityContext';
import useIsCollectionDerivation from 'src/hooks/details/useIsCollectionDerivation';

function useEntityShouldShowLogs() {
    const entityType = useEntityType();
    const isDerivation = useIsCollectionDerivation();

    return useMemo(
        () =>
            entityType === 'capture' ||
            entityType === 'materialization' ||
            isDerivation,
        [entityType, isDerivation]
    );
}

export default useEntityShouldShowLogs;
