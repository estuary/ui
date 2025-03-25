import React from 'react';
import type { VariableSizeList } from 'react-window';

export function useResetCache(data: any) {
    const ref = React.useRef<VariableSizeList>(null);
    React.useEffect(() => {
        if (ref.current !== null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}
