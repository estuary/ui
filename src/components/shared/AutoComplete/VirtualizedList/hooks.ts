import type { VariableSizeList } from 'react-window';

import { useEffect, useRef } from 'react';

export function useResetCache(data: any) {
    const ref = useRef<VariableSizeList>(null);
    useEffect(() => {
        if (ref.current !== null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}
