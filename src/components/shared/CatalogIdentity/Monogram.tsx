import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';

import { Box } from '@mui/material';

import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { hasLength, splitCatalogName } from 'src/utils/misc-utils';
import { stringToReadableColor } from 'src/utils/stableColor';

const MONOGRAM_FADE_MS = 1000;
const NAME_COLOR_DEBOUNCE_MS = 400;

interface MonogramProps {
    catalogName: string;
    /** Square size in pixels; the font scales to one third of this value. */
    size: number;
    sx?: SystemStyleObject<Theme>;
}

const MONOGRAM_TEXT_COLOR = '#06121F';

export function Monogram({ catalogName, size, sx }: MonogramProps) {
    const colorIdentity = useDebouncedValue(
        catalogName,
        NAME_COLOR_DEBOUNCE_MS
    );
    const { leaf } = splitCatalogName(catalogName);
    const letter = leaf
        .replace(/[^a-z0-9]/gi, '')
        .slice(0, 1)
        .toUpperCase();
    const filled = hasLength(colorIdentity);
    const monogramSx: SystemStyleObject<Theme> = {
        width: size,
        height: size,
        flex: 'none',
        borderRadius: (theme) => theme.radius.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size / 3),
        fontWeight: 700,
        color: MONOGRAM_TEXT_COLOR,
        border: '1px dashed transparent',
        transition: `background ${MONOGRAM_FADE_MS}ms ease, border-color ${MONOGRAM_FADE_MS}ms ease, color ${MONOGRAM_FADE_MS}ms ease`,
    };

    return (
        <Box
            sx={{
                ...monogramSx,
                background: filled
                    ? stringToReadableColor(
                          colorIdentity,
                          MONOGRAM_TEXT_COLOR,
                          {
                              saturation: 80,
                          }
                      )
                    : 'transparent',
                borderColor: filled ? 'transparent' : 'text.disabled',
                color: filled ? MONOGRAM_TEXT_COLOR : 'text.secondary',
                ...sx,
            }}
        >
            {hasLength(catalogName) ? letter : null}
        </Box>
    );
}
