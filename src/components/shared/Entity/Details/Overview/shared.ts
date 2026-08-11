import { DateTime } from 'luxon';

/**
 * How stale a freshness figure on this page can be purely because of reporting.
 *
 * Task stats reach `catalog_stats` through two derivation rollups and a
 * materialization. Measured 2026-08-06 by scraping the OpenMetrics endpoint and
 * comparing every freshness gauge against wall clock: ~400 independent
 * derivations under `ops/` clustered at 260-280s, and the 125 capture bindings
 * under `estuary/` bottomed out at 253s. Two unrelated tenants, same floor, so
 * it is the pipeline rather than any one task's real lag.
 *
 * This is why nothing here renders seconds. A local stack has no such floor —
 * it is one process — which is exactly how a dev-VM screenshot showing
 * "8 seconds" hid the problem.
 */
export const REPORTING_FLOOR_SECONDS = 270;

const UNIT_LABEL_IDS = {
    minutes: 'detailsPanel.elapsed.minutes',
    hours: 'detailsPanel.elapsed.hours',
    days: 'detailsPanel.elapsed.days',
} as const;

export interface Elapsed {
    unitLabelId: string;
    value: number;
}

/**
 * Time since a timestamp, as a number and a unit, floored at one minute.
 *
 * Split rather than pre-formatted so a caller can give the number visual weight
 * separately from its unit.
 *
 * Minutes are the finest unit on purpose — see REPORTING_FLOOR_SECONDS. A value
 * under a minute means the clocks disagree, not that data landed this second.
 */
export const getElapsed = (timestamp: string): Elapsed => {
    const seconds = Math.max(
        0,
        Math.round(
            Math.abs(DateTime.fromISO(timestamp).diffNow('seconds').seconds)
        )
    );

    if (seconds < 3600) {
        return {
            // Never zero: "0 minutes ago" claims a precision the pipeline
            // cannot deliver.
            value: Math.max(1, Math.round(seconds / 60)),
            unitLabelId: UNIT_LABEL_IDS.minutes,
        };
    }

    if (seconds < 86400) {
        return {
            value: Math.round(seconds / 3600),
            unitLabelId: UNIT_LABEL_IDS.hours,
        };
    }

    return {
        value: Math.round(seconds / 86400),
        unitLabelId: UNIT_LABEL_IDS.days,
    };
};

/**
 * Card heading weight for this page.
 *
 * The app-wide `cardHeaderSx` is `fontWeight: 300`, which is thin enough that a
 * heading reads as a caption when it sits above a table of bold figures. The
 * design puts these nearer 600, so the Overview's card titles carry that and
 * `cardHeaderSx` is left alone for everywhere else.
 */
export const OVERVIEW_CARD_TITLE_WEIGHT = 600;

/**
 * One style for every card heading on this page.
 */
export const OVERVIEW_CARD_TITLE_SX = {
    fontSize: 16,
    fontWeight: OVERVIEW_CARD_TITLE_WEIGHT,
};
