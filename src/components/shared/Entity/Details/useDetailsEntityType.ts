import { useEntityType } from 'context/EntityContext';

import { useMemo } from 'react';
import { ShardEntityTypes } from 'stores/ShardDetail/types';
import useIsCollectionDerivation from './useIsCollectionDerivation';

function useDetailsEntityType() {
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

export default useDetailsEntityType;
