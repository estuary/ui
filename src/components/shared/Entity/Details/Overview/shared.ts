import type { DateTime } from 'luxon';

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
 * Minutes are the finest unit on purpose. Task stats reach `catalog_stats`
 * through two derivation rollups and a materialization, which floors reporting
 * at roughly 270 seconds — measured 2026-08-06 against the OpenMetrics endpoint,
 * where ~400 independent derivations under `ops/` clustered at 260-280s and the
 * 125 capture bindings under `estuary/` bottomed out at 253s. Two unrelated
 * tenants, same floor, so it is the pipeline rather than any one task's real lag.
 * A value under a minute means the clocks disagree, not that data landed this
 * second. A local stack has no such floor — it is one process — which is exactly
 * how a dev-VM screenshot showing "8 seconds" hid this.
 *
 * Takes a parsed `DateTime` rather than an ISO string: the caller needs the same
 * instant for the timestamp it shows on hover, so parsing here as well would
 * parse every row twice.
 */
export const getElapsed = (timestamp: DateTime): Elapsed => {
    const seconds = Math.max(
        0,
        Math.round(Math.abs(timestamp.diffNow('seconds').seconds))
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
