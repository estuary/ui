import type { SxProps, Theme } from '@mui/material';

import { Duration } from 'luxon';

/**
 * Layout for the strip's stat cards.
 *
 * Each fact is its own bordered card rather than a region of one card separated
 * by hairlines. Dividers were three separate bugs: a cell cannot know whether it
 * starts a row, so a wrapped row drew a rule into empty space; a 2x2 put a cross
 * through the card; and because the cells are unequal heights the vertical rule
 * landed at a different length in each row. A card has its own border on all
 * four sides, so none of those questions arise.
 *
 * Two states, no two-up middle: every card on one row, or every card stacked.
 *
 * Takes the card count so the wide state is exactly that many columns — a fixed
 * four would leave a materialization's three cards hugging the left with a
 * quarter of the row empty.
 *
 * Exported so the Storybook harness renders the identical grid rather than its
 * own copy, which is the only way a screenshot of it proves anything about the
 * real thing.
 *
 * `alignItems: stretch` keeps the cards a uniform height, which matters more
 * now that each has a visible border — ragged card bottoms read as a mistake in
 * a way ragged text does not.
 */
export const getStripGridSx =
    (cardCount: number): SxProps<Theme> =>
    (theme: Theme) => ({
        alignItems: 'stretch',
        display: 'grid',
        gap: 1.5,
        // Note this theme overrides MUI's defaults — `md` is 900, `lg` is 1440 —
        // so keying the wide state to `lg` would leave the cards stacked on
        // essentially every laptop. Breakpoints are viewport-based and cannot
        // see whether the ~230px sidebar is expanded, so `md` is a judgement
        // call: snug with it open, comfortable with it collapsed.
        [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
        // The last card is Status, which also carries the connector's own
        // message — prose, where every other card holds a number or two words.
        // Extra width is what keeps that message to a line or two instead of
        // setting the height of the whole row.
        [theme.breakpoints.up('md')]: {
            gridTemplateColumns: `repeat(${cardCount - 1}, minmax(0, 1fr)) minmax(0, 1.7fr)`,
        },
    });

/**
 * The task's configured sync schedule, if it has one.
 *
 * With no freshness figure on the page, this is the only statement the strip
 * makes about currency — and it is a statement about *intent*, read from the
 * spec, not a measurement of what the task has actually done. The product's own
 * term for it is "sync schedule" — never "commit delay".
 */
export const getSyncFrequency = (
    spec: { endpoint?: any } | undefined
): string | undefined => {
    const syncFrequency =
        spec?.endpoint?.connector?.config?.syncSchedule?.syncFrequency;

    if (typeof syncFrequency !== 'string' || syncFrequency.length === 0) {
        return undefined;
    }

    // The stored pattern is close enough to ISO 8601 to parse with a PT prefix,
    // matching what useSyncScheduleDelayWarning already does.
    const duration = Duration.fromISO(`PT${syncFrequency.toUpperCase()}`);

    return duration.isValid
        ? duration.rescale().toHuman({ unitDisplay: 'short' })
        : syncFrequency;
};
