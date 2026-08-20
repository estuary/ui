import type { ReactNode } from 'react';

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import { Box, Stack } from '@mui/material';

// Maximum fade depth at each edge, and the scroll distance (px) over which it
// ramps in. At an edge the fade is 0, so the first/last row is fully visible.
const FADE = 14;
const RAMP = 10;

// Rate the sweep holds through the middle of a pass, in px/s.
const SCROLL_SPEED = 32;

// Distance over which the rate eases away from an end and into the far one, and
// the pause held at each end. Both ends of a pass hold, and the direction
// alternates, so a turnaround pauses for twice HOLD_SECONDS.
const EASE_ZONE = 20;
const HOLD_SECONDS = 0.2;

// Samples taken of the position curve to build the animation's keyframes. The
// compositor interpolates linearly between them, which is exact through the
// constant middle and fine-grained enough for the eased ends.
const SAMPLES = 48;

const MASK = `linear-gradient(to bottom, transparent 0, #000 var(--top-fade, 0px), #000 calc(100% - var(--bottom-fade, 0px)), transparent 100%)`;

interface GrantScrollerProps {
    baseHeight: number;
    cardHovered: boolean;
    children: ReactNode;
}

interface SweepCurve {
    durationMs: number;
    points: { at: number; px: number }[];
}

// One-way pass of the sweep, sampled as (time fraction, px) pairs: it holds at
// the near end, eases up to the cruising rate over EASE_ZONE, holds that rate
// through the middle, then eases down into the far end and holds again. The
// samples serve as the animation's keyframes and as the table that maps a
// position back to a time.
function buildSweep(distance: number): SweepCurve {
    const zone = Math.min(EASE_ZONE, distance / 2);
    const ramp = (2 * zone) / SCROLL_SPEED;
    const cruise = (distance - 2 * zone) / SCROLL_SPEED;
    const moving = 2 * ramp + cruise;
    const total = moving + 2 * HOLD_SECONDS;

    // Integral of a smoothstep rate ramp, so the rate leaves an end at zero and
    // arrives at the cruising rate with no kink.
    const ramped = (fraction: number) =>
        SCROLL_SPEED *
        ramp *
        (fraction * fraction * fraction -
            (fraction * fraction * fraction * fraction) / 2);

    const positionAt = (seconds: number) => {
        if (seconds <= 0) {
            return 0;
        }

        if (seconds >= moving) {
            return distance;
        }

        if (seconds < ramp) {
            return ramped(seconds / ramp);
        }

        if (seconds < ramp + cruise) {
            return zone + SCROLL_SPEED * (seconds - ramp);
        }

        return distance - ramped((moving - seconds) / ramp);
    };

    const points = [];

    for (let index = 0; index <= SAMPLES; index += 1) {
        const at = index / SAMPLES;

        points.push({ at, px: positionAt(at * total - HOLD_SECONDS) });
    }

    return { durationMs: total * 1000, points };
}

// Time fraction at which the sweep sits at `px`, read off the same samples the
// animation interpolates, so seeking to it lands exactly on that position.
function sweepTimeAt(curve: SweepCurve, px: number) {
    const { points } = curve;
    const target = Math.min(Math.max(px, 0), points[points.length - 1].px);

    for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const next = points[index];

        if (target <= next.px) {
            const span = next.px - previous.px;
            const share = span > 0 ? (target - previous.px) / span : 0;

            return previous.at + share * (next.at - previous.at);
        }
    }

    return 1;
}

// Wheel deltas arrive in pixels, lines, or pages depending on the device and
// the browser. Normalize to pixels so a gesture moves the list by what it asked
// for.
const LINE_HEIGHT = 16;

function wheelPixels(event: WheelEvent, viewport: HTMLElement) {
    if (event.deltaMode === 1) {
        return event.deltaY * LINE_HEIGHT;
    }

    if (event.deltaMode === 2) {
        return event.deltaY * viewport.clientHeight;
    }

    return event.deltaY;
}

// How far the list is displaced, whichever mechanism put it there: the sweep
// writes a transform for the compositor to interpolate, and the reader's wheel
// writes scrollTop. Only one is ever in effect, so the sum is the position.
function currentOffset(viewport: HTMLElement, inner: HTMLElement) {
    const transform = getComputedStyle(inner).transform;
    const translated =
        transform && transform !== 'none'
            ? -new DOMMatrixReadOnly(transform).m42
            : 0;

    return viewport.scrollTop + translated;
}

// Holds the list to `baseHeight` and clips the overflow. The height is a flex
// basis rather than a cap, so a card left taller than its content by a
// neighboring card hands the slack to the list and more rows show.
//
// Each edge fades in proportion to how far the content has scrolled away from
// it — no top fade at the very top, no bottom fade at the very bottom.
//
// When the content overflows, hovering the list sweeps through it, and moving
// off the list pauses it in place. The viewport is also a real scroll container,
// so a wheel over the list takes the position over and the sweep stays off for
// the rest of the visit. Leaving the card ends the visit and hands the position
// back to the sweep, in place, so the next hover of the list carries on from
// where the reader stopped. Nothing here ever rewinds the list.
export function GrantScroller({
    baseHeight,
    cardHovered,
    children,
}: GrantScrollerProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [overflow, setOverflow] = useState(0);

    // The sweep answers to the pointer over the list itself. The card is a much
    // larger target, and hovering its header or its expiry band is not a request
    // to read the grants.
    const [hovered, setHovered] = useState(false);

    const sweep = useRef<Animation | null>(null);
    const curve = useRef<SweepCurve | null>(null);

    // Set once the wheel moves the list, so the position lives in scrollTop and
    // the sweep stays off. Cleared when the pointer leaves the card and the
    // sweep takes the position back.
    const readerScrolled = useRef(false);

    // Fades last written. A frame that would not change them leaves the mask
    // alone, since rewriting it rasterizes the gradient again.
    const written = useRef({ top: -1, bottom: -1 });

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

    // Derive the edge fades from the live position so they track either driver.
    const syncFade = useCallback(() => {
        const viewport = viewportRef.current;
        const inner = innerRef.current;

        if (!viewport || !inner) {
            return;
        }

        // Half-pixel steps are finer than the fade reads, and they keep the
        // mask from being rewritten on every frame of a slow pass.
        const ramp = (value: number) =>
            Math.round((Math.min(Math.max(value, 0), RAMP) / RAMP) * FADE * 2) /
            2;

        const distance = viewport.scrollHeight - viewport.clientHeight;
        const scrolled = distance > 0 ? currentOffset(viewport, inner) : 0;

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

    // The sweep is a composited transform animation, held paused until hovered.
    useEffect(() => {
        const inner = innerRef.current;

        if (!inner || overflow <= 2) {
            return undefined;
        }

        const built = buildSweep(overflow);

        const animation = inner.animate(
            built.points.map(({ at, px }) => ({
                offset: at,
                transform: `translateY(-${px}px)`,
                easing: 'linear',
            })),
            {
                duration: built.durationMs,
                direction: 'alternate',
                iterations: Number.POSITIVE_INFINITY,
            }
        );

        animation.pause();

        sweep.current = animation;
        curve.current = built;

        return () => {
            animation.cancel();
            sweep.current = null;
            curve.current = null;
        };
    }, [overflow]);

    useEffect(() => {
        const viewport = viewportRef.current;
        const animation = sweep.current;
        const built = curve.current;

        if (!viewport || !animation || !built) {
            return;
        }

        // A list the reader scrolled holds their position, and the sweep leaves
        // it alone until they leave the card.
        if (readerScrolled.current) {
            return;
        }

        if (hovered) {
            animation.play();
        } else {
            animation.pause();
        }
    }, [hovered, overflow]);

    useEffect(() => {
        const viewport = viewportRef.current;
        const inner = innerRef.current;

        if (!viewport || !inner) {
            return undefined;
        }

        const takeOver = (event: WheelEvent) => {
            if (readerScrolled.current) {
                return;
            }

            readerScrolled.current = true;

            // While the sweep runs, the position lives in a transform and
            // scrollTop sits at 0, so an upward gesture has nothing to scroll
            // and the browser discards it. Claim this one event and apply its
            // delta by hand, folding the transform into scrollTop as it goes.
            // The rest of the gesture scrolls natively.
            event.preventDefault();

            const offset = currentOffset(viewport, inner);

            sweep.current?.cancel();
            viewport.scrollTop = offset + wheelPixels(event, viewport);
        };

        syncFade();

        viewport.addEventListener('wheel', takeOver, { passive: false });
        viewport.addEventListener('scroll', syncFade, { passive: true });

        return () => {
            viewport.removeEventListener('wheel', takeOver);
            viewport.removeEventListener('scroll', syncFade);
        };
    }, [overflow, syncFade]);

    // A composited transform fires no events, so the fades are sampled per
    // frame while the pointer is on the card. This only reads the position; the
    // motion itself stays on the compositor.
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

    // Leaving the card re-arms the sweep over a list the reader scrolled. The
    // list does not move: the sweep is seeked to the time that draws it where
    // they parked it, and the scroll offset is cleared in the same frame, so it
    // sits paused on that position ready for the next hover.
    useEffect(() => {
        const viewport = viewportRef.current;
        const animation = sweep.current;
        const built = curve.current;

        if (
            cardHovered ||
            !viewport ||
            !animation ||
            !built ||
            !readerScrolled.current
        ) {
            return;
        }

        animation.pause();
        animation.currentTime =
            sweepTimeAt(built, viewport.scrollTop) * built.durationMs;
        viewport.scrollTop = 0;

        readerScrolled.current = false;
    }, [cardHovered, overflow]);

    return (
        <Box
            ref={viewportRef}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
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
