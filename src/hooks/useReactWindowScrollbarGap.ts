import type { MutableRefObject } from 'react';
import type { FixedSizeList, VariableSizeList } from 'react-window';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { debounce } from 'lodash';
import { useScrollbarWidth, useUnmount } from 'react-use';

import { useReactWindowReadyToScroll } from 'src/hooks/useReactWindowReadyToScroll';
import { NEAR_INSTANT_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

export const useReactWindowScrollbarGap = <
    T extends FixedSizeList<any> | VariableSizeList<any>,
>(
    scrollingElementRef: MutableRefObject<T | undefined>,
    ignoreResize?: boolean
) => {
    const { readyToScroll, scrollingElementCallback } =
        useReactWindowReadyToScroll<T>(scrollingElementRef);

    const scrollbarWidth = useScrollbarWidth();
    const [scrollGap, setScrollGap] = useState<number | undefined>(undefined);

    const debouncedSetter = useRef(
        debounce(
            (element: HTMLDivElement) => {
                const newVal =
                    element.scrollHeight > element.clientHeight
                        ? scrollbarWidth
                        : undefined;

                setScrollGap(newVal);
            },
            // If we are ignoringResize then we need to handle checking ourselves
            //  so just run this right away
            ignoreResize ? 0 : NEAR_INSTANT_DEBOUNCE_WAIT
        )
    );
    useUnmount(() => {
        debouncedSetter.current?.cancel();
    });

    const checkScrollbarVisibility = useCallback(() => {
        if (
            typeof scrollingElementRef?.current?.props?.outerRef !==
                'function' &&
            scrollingElementRef?.current?.props?.outerRef?.current
        ) {
            debouncedSetter.current(
                scrollingElementRef.current.props.outerRef.current
            );
        }
    }, [scrollingElementRef]);

    useLayoutEffect(() => {
        let observedScrollingElement: HTMLDivElement;
        let resizeObserver: ResizeObserver;

        if (
            readyToScroll &&
            typeof scrollingElementRef?.current?.props?.outerRef !==
                'function' &&
            scrollingElementRef?.current?.props?.outerRef?.current
        ) {
            observedScrollingElement =
                scrollingElementRef?.current.props.outerRef.current;

            // Do a check right away to set this "on load"
            checkScrollbarVisibility();

            if (!Boolean(ignoreResize)) {
                // Create a ResizeObserver to monitor size changes
                resizeObserver = new ResizeObserver(() => {
                    checkScrollbarVisibility();
                });

                resizeObserver.observe(observedScrollingElement);
            }
        }

        return () => {
            if (observedScrollingElement && resizeObserver) {
                resizeObserver.unobserve(observedScrollingElement);
            }
        };
    }, [
        checkScrollbarVisibility,
        ignoreResize,
        readyToScroll,
        scrollingElementRef,
    ]);

    return useMemo(
        () => ({
            checkScrollbarVisibility,
            scrollingElementCallback,
            scrollGap,
        }),
        [checkScrollbarVisibility, scrollGap, scrollingElementCallback]
    );
};
