import { useMemo } from 'react';
import { useEntityType } from 'context/EntityContext';
import useIsCollectionDerivation from './useIsCollectionDerivation';

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
