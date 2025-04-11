import type { MutableRefObject } from 'react';
import type { FixedSizeList, VariableSizeList } from 'react-window';

import { useLayoutEffect, useState } from 'react';

import { useScrollbarWidth } from 'react-use';

import { useReactWindowReadyToScroll } from 'src/hooks/useReactWindowReadyToScroll';

export const useReactWindowScrollbarGap = <
    T extends FixedSizeList<any> | VariableSizeList<any>,
>(
    scrollingElementRef: MutableRefObject<T | null>
) => {
    const { readyToScroll, scrollingElementCallback } =
        useReactWindowReadyToScroll<T>(scrollingElementRef);

    const scrollbarWidth = useScrollbarWidth();
    const [scrollGap, setScrollGap] = useState<number | undefined>(undefined);

    // const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);

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

            const checkScrollbarVisibility = () => {
                if (
                    typeof scrollingElementRef?.current?.props?.outerRef !==
                        'function' &&
                    scrollingElementRef?.current?.props?.outerRef?.current
                ) {
                    setScrollGap(
                        scrollingElementRef.current.props.outerRef.current
                            .scrollHeight >
                            scrollingElementRef.current.props.outerRef?.current
                                .clientHeight
                            ? scrollbarWidth
                            : undefined
                    );
                }
            };

            // Do a check right away to set this "on load"
            checkScrollbarVisibility();

            // Create a ResizeObserver to monitor size changes
            resizeObserver = new ResizeObserver(() => {
                checkScrollbarVisibility();
            });

            resizeObserver.observe(observedScrollingElement);
        }

        return () => {
            if (observedScrollingElement && resizeObserver) {
                resizeObserver.unobserve(observedScrollingElement);
            }
        };
    }, [readyToScroll, scrollbarWidth, scrollingElementRef]);

    return {
        scrollingElementCallback,
        scrollGap,
    };
};
