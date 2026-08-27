import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';
import type { ReactNode } from 'react';

import { useLayoutEffect, useRef, useState } from 'react';

import { Box, ButtonBase } from '@mui/material';
import { decomposeColor, recomposeColor } from '@mui/material/styles';

export type BandSide = 'top' | 'bottom' | 'left' | 'right';

/** On the face element, so an owner can restyle it from the frame's hover. */
export const BANDED_DIV_FACE_CLASS = 'banded-div-face';

const BAND_CLASS = 'banded-div-band';

/** How far an interactive band's rest color sits from its full color. */
export const BAND_REST_SATURATION = 0.5;

// How much of the band's visible run stays clear of the face overlap, so its
// label never slips under the face's edge.
const BAND_OVERLAP_GAP = 4;

/**
 * Pulls a color toward its own luminance, which is what the CSS `saturate()`
 * filter computes, so a color mixed here matches one the browser filters.
 * Exported for owners that hold other surfaces to the band's rest color.
 */
export function desaturate(color: string, amount: number) {
    const [red, green, blue] = decomposeColor(color).values;
    const luminance = 0.213 * red + 0.715 * green + 0.072 * blue;
    const mix = (channel: number) =>
        Math.round(luminance + (channel - luminance) * amount);

    return recomposeColor({
        type: 'rgb',
        values: [mix(red), mix(green), mix(blue)],
    });
}

// Rotates its child 90° as one unit. A CSS transform never affects layout —
// a rotated label would keep its wide horizontal box and stretch the band —
// so the child is measured and its dimensions swapped onto a spacer, with the
// rotated child centered absolutely inside it.
function RotatedLabel({ children }: { children: ReactNode }) {
    const labelRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ width: number; height: number } | null>(
        null
    );

    useLayoutEffect(() => {
        const el = labelRef.current;

        if (!el) {
            return undefined;
        }

        const measure = () =>
            setSize({ width: el.offsetWidth, height: el.offsetHeight });

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return (
        <Box
            sx={{
                position: 'relative',
                width: size?.height,
                height: size?.width,
            }}
        >
            <Box
                ref={labelRef}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    // Sized to its content: an absolutely positioned box would
                    // otherwise shrink to the narrow spacer and wrap.
                    width: 'max-content',
                    transform: 'translate(-50%, -50%) rotate(90deg)',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

interface BandedDivProps {
    /** The edge carrying the band. */
    side?: BandSide;
    /**
     * The band's full-strength color. With `onClick` set, the band rests
     * desaturated and comes up to this color on hover. Omit to render the
     * frame and face alone.
     */
    bandColor?: string;
    /**
     * Rendered centered inside the band, and rotated 90° as a unit when the
     * band is on the left or right. The node owns its internal layout — pass
     * a row Stack for an icon-and-text label.
     */
    label?: ReactNode;
    /** Makes the whole frame a button, and the band's color hover-driven. */
    onClick?: () => void;
    /** Corner radius shared by the frame and the face. */
    radius?: 'sm' | 'md' | 'lg' | 'xl';
    /**
     * Merged onto the face. Give the face an opaque background: the band tucks
     * behind it, and anything translucent lets the band ghost through.
     */
    faceSx?: SystemStyleObject<Theme>;
    sx?: SxProps<Theme>;
    children: ReactNode;
}

/**
 * A rounded frame whose face sits over a colored band poking out one edge.
 *
 * The band is pulled under the face by one corner radius, so the face's
 * rounded corners curve away onto band color rather than opening gaps to the
 * page. The face paints above it (`zIndex: 1`, opaque), and the frame's
 * `overflow: hidden` clips the band's outer corners to the frame radius, so
 * the band needs no radius of its own.
 */
export function BandedDiv({
    side = 'left',
    bandColor,
    label,
    onClick,
    radius = 'lg',
    faceSx,
    sx,
    children,
}: BandedDivProps) {
    const interactive = Boolean(onClick);
    const verticalBand = side === 'left' || side === 'right';
    const bandFirst = side === 'top' || side === 'left';

    const cornerRadius = (theme: Theme) => theme.radius[radius];
    const overlap = (theme: Theme) =>
        `calc(${theme.radius[radius]} + ${BAND_OVERLAP_GAP}px)`;

    // The negative margin tucks the band under the face by one corner radius;
    // the matching padding keeps the label out past the overlap.
    const tuckSx: Record<BandSide, SystemStyleObject<Theme>> = {
        top: { mb: (theme) => `-${cornerRadius(theme)}`, pb: overlap },
        bottom: { mt: (theme) => `-${cornerRadius(theme)}`, pt: overlap },
        left: { mr: (theme) => `-${cornerRadius(theme)}`, pr: overlap },
        right: { ml: (theme) => `-${cornerRadius(theme)}`, pl: overlap },
    };

    const face = (
        <Box
            key="face"
            className={BANDED_DIV_FACE_CLASS}
            sx={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                minWidth: 0,
                borderRadius: cornerRadius,
                ...faceSx,
            }}
        >
            {children}
        </Box>
    );

    const band =
        bandColor !== undefined ? (
            <Box
                key="band"
                className={BAND_CLASS}
                sx={{
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...(verticalBand
                        ? { px: 0.5, py: 1.5 }
                        : { px: 1.5, py: 0.5 }),
                    ...tuckSx[side],
                    background: interactive
                        ? desaturate(bandColor, BAND_REST_SATURATION)
                        : bandColor,
                    color: (theme) => theme.palette.getContrastText(bandColor),
                    transition: 'background-color 0.1s ease',
                }}
            >
                {verticalBand ? <RotatedLabel>{label}</RotatedLabel> : label}
            </Box>
        ) : null;

    const frameSx: SystemStyleObject<Theme> = {
        display: 'flex',
        flexDirection: verticalBand ? 'row' : 'column',
        alignItems: 'stretch',
        borderRadius: cornerRadius,
        overflow: 'hidden',
        ...(interactive && bandColor
            ? {
                  [`&:hover .${BAND_CLASS}`]: { background: bandColor },
              }
            : {}),
    };

    const content = bandFirst ? [band, face] : [face, band];
    const sxLayers = Array.isArray(sx) ? sx : [sx ?? {}];

    return onClick ? (
        <ButtonBase
            onClick={onClick}
            sx={[frameSx, { textAlign: 'left' }, ...sxLayers]}
        >
            {content}
        </ButtonBase>
    ) : (
        <Box sx={[frameSx, ...sxLayers]}>{content}</Box>
    );
}
