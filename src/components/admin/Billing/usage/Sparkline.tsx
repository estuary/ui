import type { MouseEvent } from 'react';

import { useMemo, useState } from 'react';

import { alpha, Box, useTheme } from '@mui/material';

import { numericSx } from 'src/components/admin/Billing/shared/CardHeader';
import {
    defaultOutline,
    semiTransparentBackground_oneLayerElevated,
} from 'src/context/Theme';

// Points run edge to edge: the first at the left, the last at the right.
const xOf = (index: number, count: number) =>
    count > 1 ? index / (count - 1) : 0.5;

// A line with a faint fill in a 1000 x 100 box, stopping at the first value
// still to come. A lone point draws as a level line.
const toPaths = (values: (number | null)[]) => {
    const max = Math.max(0, ...values.map((value) => value ?? 0));
    const ys = values.map((value) =>
        value === null ? null : 98 - (max > 0 ? value / max : 0) * 88
    );

    const points: [number, number][] = [];
    for (const [index, y] of ys.entries()) {
        if (y === null) {
            break;
        }
        points.push([xOf(index, values.length) * 1000, y]);
    }

    if (points.length === 1) {
        points.splice(0, 1, [0, points[0][1]], [1000, points[0][1]]);
    }

    if (points.length === 0) {
        return { area: '', line: '', ys };
    }

    const line = `M${points
        .map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`)
        .join('L')}`;
    const area = `${line}L${points[points.length - 1][0].toFixed(1)} 100L${points[0][0].toFixed(1)} 100Z`;

    return { area, line, ys };
};

interface Props {
    color: string;
    // The hover label for a point, as "Nov 8 · 15.4 GB".
    describe: (index: number, value: number) => string;
    // Null for a bucket still to come.
    values: (number | null)[];
}

// A task's trend over the period. It reads the same for 4 days or 12 months;
// hovering marks the nearest point. Decorative to assistive technology, as the
// row's cells state its totals.
export function Sparkline({ color, describe, values }: Props) {
    const theme = useTheme();
    const [hovered, setHovered] = useState<number | null>(null);

    const { area, line, ys } = useMemo(() => toPaths(values), [values]);

    const onMouseMove = (event: MouseEvent<HTMLElement>) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        if (!width) {
            return;
        }

        const last = values.length - 1;
        const index = Math.max(
            0,
            Math.min(last, Math.round(((event.clientX - left) / width) * last))
        );

        setHovered(values[index] === null ? null : index);
    };

    const hoveredValue = hovered === null ? null : values[hovered];
    // The card's own color, so the dot and label sit on it cleanly.
    const surface =
        semiTransparentBackground_oneLayerElevated[theme.palette.mode];
    const x = hovered === null ? 0 : xOf(hovered, values.length);

    return (
        <Box
            onMouseLeave={() => setHovered(null)}
            onMouseMove={onMouseMove}
            sx={{
                position: 'relative',
                height: 28,
                minWidth: 0,
                cursor: 'crosshair',
            }}
        >
            <svg
                aria-hidden
                preserveAspectRatio="none"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    display: 'block',
                }}
                viewBox="0 0 1000 100"
            >
                <path
                    d="M0 99.5H1000"
                    fill="none"
                    stroke={theme.palette.divider}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                />
                <path d={area} fill={alpha(color, 0.16)} />
                <path
                    d={line}
                    fill="none"
                    stroke={color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {hovered !== null && hoveredValue !== null ? (
                <>
                    <Box
                        aria-hidden
                        sx={{
                            position: 'absolute',
                            left: `${x * 100}%`,
                            top: `${ys[hovered] ?? 98}%`,
                            width: 7,
                            height: 7,
                            m: '-3.5px 0 0 -3.5px',
                            borderRadius: '50%',
                            bgcolor: color,
                            boxShadow: `0 0 0 2px ${surface}`,
                            pointerEvents: 'none',
                        }}
                    />

                    <Box
                        aria-hidden
                        sx={{
                            ...numericSx,
                            position: 'absolute',
                            bottom: 'calc(100% + 6px)',
                            left: `${x * 100}%`,
                            // Kept clear of the cell's ends.
                            transform:
                                x > 0.75
                                    ? 'translateX(-100%)'
                                    : x < 0.25
                                      ? 'none'
                                      : 'translateX(-50%)',
                            px: 1,
                            py: 0.375,
                            borderRadius: 1,
                            bgcolor: surface,
                            border: defaultOutline[theme.palette.mode],
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                            zIndex: 2,
                            pointerEvents: 'none',
                        }}
                    >
                        {describe(hovered, hoveredValue)}
                    </Box>
                </>
            ) : null}
        </Box>
    );
}
