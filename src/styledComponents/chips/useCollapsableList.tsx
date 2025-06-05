import type { CollapsableListResponse } from 'src/styledComponents/types';

import { useEffect, useMemo, useRef, useState } from 'react';

export function useCollapsableList<T>(
    elements: T[],
    maxLength?: number
): CollapsableListResponse<T> {
    const listScroller = useRef<HTMLDivElement>(null);

    const listLength = useMemo(() => elements.length, [elements]);
    const [maxRender, setMaxRender] = useState(maxLength ?? listLength);

    // See how many values are hidden
    const hiddenCount = useMemo(
        () => listLength - maxRender,
        [listLength, maxRender]
    );

    // Slice off the right number of values to display
    const list = useMemo(
        () => elements.slice(0, maxRender),
        [elements, maxRender]
    );

    const showEntireList = () => {
        setMaxRender(listLength);
    };

    // When all chips are shown scroll down just a hair to try to make
    //   sure the user knows that the list is scrollable
    useEffect(() => {
        if (!listScroller.current || maxRender !== listLength) {
            return;
        }

        listScroller.current.scrollTop += 20;
    }, [listLength, maxRender]);

    return { hiddenCount, list, listScroller, showEntireList };
}
