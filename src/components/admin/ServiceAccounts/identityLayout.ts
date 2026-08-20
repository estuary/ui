import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';

import { MONOGRAM_TEXT_COLOR } from 'src/components/admin/ServiceAccounts/shared';

// The card an account is presented as: a monogram tile over its stable color,
// with the leaf name above the catalog location it lives under. Shared by the
// create dialog, which makes the two lines editable, and the details page,
// which does not — so an account looks the same before and after it exists.

// How long the monogram takes to cross-fade to a new color.
export const MONOGRAM_FADE_MS = 1000;

export const TRUNCATE_SX = {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
} as const;

// Every measurement at scale 1, as the create dialog uses it.
const BASE = {
    cardHeight: 72,
    nameFontSize: 18,
    nameLineHeight: 24,
    locationFontSize: 14,
    locationLineHeight: 22,
    monogramFontSize: 20,
};

/**
 * The card's measurements, multiplied by `scale`.
 *
 * Every value is rounded to whole pixels. The name and location line boxes are
 * pinned rather than left to each element's default, because the create dialog
 * swaps each line between a span and an input — they derive different line
 * boxes, and the text would shift as they swap. A fractional line box would put
 * that alignment back off by a subpixel.
 */
export function identityLayout(scale = 1) {
    const px = (value: number) => Math.round(value * scale);

    const cardHeight = px(BASE.cardHeight);
    const nameLineHeight = px(BASE.nameLineHeight);

    const nameTextSx = {
        fontFamily: 'monospace',
        fontWeight: 600,
        fontSize: px(BASE.nameFontSize),
        lineHeight: `${nameLineHeight}px`,
    } as const;

    const locationTextSx = {
        fontFamily: 'monospace',
        fontSize: px(BASE.locationFontSize),
        lineHeight: `${px(BASE.locationLineHeight)}px`,
    } as const;

    const cardSx: SystemStyleObject<Theme> = {
        alignItems: 'center',
        height: cardHeight,
        overflow: 'hidden',
    };

    // Stretched to the monogram so the name's line box starts at its top edge
    // and the location ends at its bottom, rather than the pair floating
    // centered against it.
    const columnSx: SystemStyleObject<Theme> = {
        minWidth: 0,
        flex: 1,
        py: 0.25,
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
    };

    // Squared off the card height, so the two track together.
    const monogramSx: SystemStyleObject<Theme> = {
        height: '100%',
        aspectRatio: '1 / 1',
        flex: 'none',
        borderRadius: (theme) => theme.radius.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: px(BASE.monogramFontSize),
        fontWeight: 700,
        color: MONOGRAM_TEXT_COLOR,
        // Carried in both states so the tile keeps its footprint, and so an
        // unnamed account can fade in and out rather than snap.
        border: '1px dashed transparent',
        transition: `background ${MONOGRAM_FADE_MS}ms ease, border-color ${MONOGRAM_FADE_MS}ms ease, color ${MONOGRAM_FADE_MS}ms ease`,
    };

    return {
        cardHeight,
        nameLineHeight,
        cardSx,
        columnSx,
        monogramSx,
        nameTextSx,
        locationTextSx,
    };
}
