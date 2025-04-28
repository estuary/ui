import type { MutableRefObject } from 'react';
import type { FixedSizeList, VariableSizeList } from 'react-window';

import { useCallback, useState } from 'react';

export const useReactWindowReadyToScroll = <
    T extends FixedSizeList<any> | VariableSizeList<any>,
>(
    tableScroller: MutableRefObject<T | undefined>
) => {
    const [readyToScroll, setReadyToScroll] = useState(false);

    const scrollingElementCallback: (node?: any) => T | undefined = useCallback(
        (node?) => {
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
