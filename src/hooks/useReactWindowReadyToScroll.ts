import type { MutableRefObject } from 'react';
import type { FixedSizeList, VariableSizeList } from 'react-window';

import { useCallback, useState } from 'react';

export const useReactWindowReadyToScroll = <
    T extends FixedSizeList<any> | VariableSizeList<any>,
>(
    tableScroller: MutableRefObject<T | null>
) => {
    const [readyToScroll, setReadyToScroll] = useState(false);

    const scrollingElementCallback = useCallback(
        (node?: T): T | null => {
            if (node) {
                tableScroller.current = node;
                setReadyToScroll(true);
            }

            return tableScroller.current;
        },
        [tableScroller]
    );

    return {
        readyToScroll,
        scrollingElementCallback,
    };
};
