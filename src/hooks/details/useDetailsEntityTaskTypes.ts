import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

import { useMemo } from 'react';

import { useEntityType } from 'src/context/EntityContext';
import useIsCollectionDerivation from 'src/hooks/details/useIsCollectionDerivation';

function useDetailsEntityTaskTypes() {
    const entityType = useEntityType();
    const isCollection = entityType === 'collection';
    const isDerivation = useIsCollectionDerivation();

    const taskTypes: ShardEntityTypes[] = useMemo(() => {
        if (!isCollection || isDerivation) {
            return isDerivation ? ['derivation'] : [entityType];
        }

        return [];
    }, [entityType, isCollection, isDerivation]);

    return taskTypes;
}

export default useDetailsEntityTaskTypes;
