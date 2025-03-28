import { useMemo } from 'react';

import useIsCollectionDerivation from './useIsCollectionDerivation';

import { useEntityType } from 'src/context/EntityContext';
import { ShardEntityTypes } from 'src/stores/ShardDetail/types';

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
