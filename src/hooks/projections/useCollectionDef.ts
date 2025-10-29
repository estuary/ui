import { useCallback } from 'react';

function useCollectionDef() {
    return useCallback(() => {
        return {
            hasReadSchema: true,
            hasWriteSchema: true,
            model: {},
        };
    }, []);
}

export default useCollectionDef;
