import type { ReactNode } from 'react';

import { Box } from '@mui/material';

/**
 * Splits a catalog path so it wraps only at its separators.
 *
 * Each segment is held on one line and followed by a break opportunity, so a
 * long path folds at `/` boundaries instead of mid-name: `acmeCo/` reads as a
 * name, `acme` + `Co/` does not.
 *
 * A segment too wide for the container is truncated with an ellipsis rather
 * than broken or left to overflow. It then fills its line, so the segment after
 * it starts on the next one.
 */
export function breakAtSlashes(path: string): ReactNode[] {
    return path
        .split(/(?<=\/)/)
        .filter(Boolean)
        .flatMap((segment, index) => [
            <Box
                key={`segment-${index}`}
                component="span"
                sx={{
                    // `inline-block` is what gives the segment a box to
                    // truncate within, while still allowing a wrap either side
                    // of it.
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    // An `overflow: hidden` inline-block otherwise takes its
                    // bottom edge as the baseline, which drops the text below
                    // the line it shares with plain content.
                    verticalAlign: 'bottom',
                }}
            >
                {segment}
            </Box>,
            <wbr key={`break-${index}`} />,
        ]);
}
