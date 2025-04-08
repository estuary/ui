import { useMemo } from 'react';

import useIsCollectionDerivation from 'src/components/shared/Entity/Details/useIsCollectionDerivation';
import { useEntityType } from 'src/context/EntityContext';

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
