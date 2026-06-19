import type { ReactNode } from 'react';

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import { Box, keyframes, Stack } from '@mui/material';

// Maximum fade depth at each edge, and the scroll distance (px) over which it
// ramps in. At an edge the fade is 0, so the first/last row is fully visible.
const FADE = 14;
const RAMP = 10;

const MASK = `linear-gradient(to bottom, transparent 0, #000 var(--top-fade, 0px), #000 calc(100% - var(--bottom-fade, 0px)), transparent 100%)`;

// Gently scroll the clipped content top-to-bottom while the card is hovered;
// ease-in-out softens each turnaround.
const reveal = keyframes`
    0% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(var(--grant-scroll-distance, 0px));
    }
`;

interface GrantScrollerProps {
    maxHeight: number;
    hovered: boolean;
    children: ReactNode;
}

// Caps the list height and clips the overflow. Each edge fades in proportion to
// how far the content has scrolled away from it — no top fade at the very top,
// no bottom fade at the very bottom. When the content overflows, hovering the
// card auto-scrolls through it; leaving pauses it in place.
export function GrantScroller({
    maxHeight,
    hovered,
    children,
}: GrantScrollerProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [overflow, setOverflow] = useState(0);

    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const inner = innerRef.current;

        if (!viewport || !inner) {
            return undefined;
        }

        const measure = () =>
            setOverflow(
                Math.max(0, inner.offsetHeight - viewport.clientHeight)
            );

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(viewport);
        observer.observe(inner);

        return () => observer.disconnect();
    }, []);

    // Derive the edge fades from the inner element's current translateY so they
    // track the live scroll position, including while paused mid-scroll.
    const syncFade = useCallback(() => {
        const viewport = viewportRef.current;
        const inner = innerRef.current;

        if (!viewport || !inner) {
            return;
        }

        const ramp = (value: number) =>
            (Math.min(Math.max(value, 0), RAMP) / RAMP) * FADE;

        const distance = inner.offsetHeight - viewport.clientHeight;

        if (distance <= 0) {
            viewport.style.setProperty('--top-fade', '0px');
            viewport.style.setProperty('--bottom-fade', '0px');
            return;
        }

        const transform = getComputedStyle(inner).transform;
        const scrolled =
            transform && transform !== 'none'
                ? -new DOMMatrixReadOnly(transform).m42
                : 0;

        viewport.style.setProperty('--top-fade', `${ramp(scrolled)}px`);
        viewport.style.setProperty(
            '--bottom-fade',
            `${ramp(distance - scrolled)}px`
        );
    }, []);

    useEffect(() => {
        let frame = 0;

        if (hovered) {
            const loop = () => {
                syncFade();
                frame = requestAnimationFrame(loop);
            };
            frame = requestAnimationFrame(loop);
        } else {
            // Settle one frame so the paused position's fade is reflected.
            frame = requestAnimationFrame(syncFade);
        }

        return () => cancelAnimationFrame(frame);
    }, [hovered, overflow, syncFade]);

    const overflowing = overflow > 2;
    // Scale duration with distance to hold a roughly constant scroll speed.
    const duration = Math.max(4, Math.round(overflow / 15) + 2);

    return (
        <Box
            ref={viewportRef}
            sx={{
                maxHeight,
                overflow: 'hidden',
                maskImage: MASK,
                WebkitMaskImage: MASK,
            }}
        >
            <Stack
                ref={innerRef}
                sx={{
                    '--grant-scroll-distance': `-${overflow}px`,
                    ...(overflowing
                        ? {
                              animation: `${reveal} ${duration}s ease-in-out infinite alternate`,
                              animationPlayState: hovered
                                  ? 'running'
                                  : 'paused',
                          }
                        : {}),
                }}
            >
                {children}
            </Stack>
        </Box>
    );
}
