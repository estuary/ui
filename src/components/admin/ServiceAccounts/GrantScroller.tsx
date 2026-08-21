import type { ReactNode } from 'react';

import { useCallback, useLayoutEffect, useRef } from 'react';

import { Box, Stack } from '@mui/material';

// Maximum fade depth at each edge, and the scroll distance (px) over which it
// ramps in. At an edge the fade is 0, so the first/last row is fully visible.
const FADE = 14;
const RAMP = 10;

const MASK = `linear-gradient(to bottom, transparent 0, #000 var(--top-fade, 0px), #000 calc(100% - var(--bottom-fade, 0px)), transparent 100%)`;

interface GrantScrollerProps {
    baseHeight: number;
    children: ReactNode;
}

// Holds the list to `baseHeight` and clips the overflow. The height is a flex
// basis rather than a cap, so a card left taller than its content by a
// neighboring card hands the slack to the list and more rows show.
//
// The viewport is a real scroll container, so a wheel or a trackpad gesture over
// the list moves it. Each edge fades in proportion to how far the content has
// scrolled away from it — no top fade at the very top, no bottom fade at the
// very bottom.
export function GrantScroller({ baseHeight, children }: GrantScrollerProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    // Fades last written. A scroll event that would not change them leaves the
    // mask alone, since rewriting it rasterizes the gradient again.
    const written = useRef({ top: -1, bottom: -1 });

    const syncFade = useCallback(() => {
        const viewport = viewportRef.current;

        if (!viewport) {
            return;
        }

        // Half-pixel steps are finer than the fade reads, and they keep the
        // mask from being rewritten on every event of a slow scroll.
        const ramp = (value: number) =>
            Math.round((Math.min(Math.max(value, 0), RAMP) / RAMP) * FADE * 2) /
            2;

        const distance = viewport.scrollHeight - viewport.clientHeight;
        const scrolled = distance > 0 ? viewport.scrollTop : 0;

        const top = distance > 0 ? ramp(scrolled) : 0;
        const bottom = distance > 0 ? ramp(distance - scrolled) : 0;

        if (top !== written.current.top) {
            viewport.style.setProperty('--top-fade', `${top}px`);
            written.current.top = top;
        }

        if (bottom !== written.current.bottom) {
            viewport.style.setProperty('--bottom-fade', `${bottom}px`);
            written.current.bottom = bottom;
        }
    }, []);

    // The fades answer to the position and to both heights, so the content and
    // the viewport are watched for resizes alongside the scroll events.
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const inner = innerRef.current;

        if (!viewport || !inner) {
            return undefined;
        }

        syncFade();

        const observer = new ResizeObserver(syncFade);
        observer.observe(viewport);
        observer.observe(inner);

        viewport.addEventListener('scroll', syncFade, { passive: true });

        return () => {
            observer.disconnect();
            viewport.removeEventListener('scroll', syncFade);
        };
    }, [syncFade]);

    return (
        <Box
            ref={viewportRef}
            sx={{
                // A scroll container's automatic minimum size is zero, so the
                // basis holds the height the card is sized around and growth
                // past it comes out of the card's spare room.
                'flex': `1 1 ${baseHeight}px`,
                'overflowX': 'hidden',
                'overflowY': 'auto',
                'maskImage': MASK,
                'WebkitMaskImage': MASK,
                // The edge fades signal the remaining content, so the scrollbar
                // itself is hidden.
                'scrollbarWidth': 'none',
                'msOverflowStyle': 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            }}
        >
            <Stack ref={innerRef}>{children}</Stack>
        </Box>
    );
}
