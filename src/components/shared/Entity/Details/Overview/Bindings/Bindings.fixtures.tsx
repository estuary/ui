import type { DataByHourRange } from 'src/components/graphs/types';
import type { BindingRow } from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type {
    MaterializationBacklog,
    MaterializationTimeLag,
} from 'src/hooks/details/shared';
import type { Entity } from 'src/types';

import { BindingsCard } from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsCard';
import {
    attachBacklogReadings,
    buildBindingRows,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { EntityContextProvider } from 'src/context/EntityContext';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

// ── Fixtures ─────────────────────────────────────────────────────────
//
// Stream names are the Greenhouse connector's public API surface; the tenant is
// a placeholder and every volume is synthetic.

const PREFIX = 'acmeco/recruiting';

// One fixture binding, positional so the table below stays readable as a table:
// stream name, bytes, docs, disabled.
export type StreamFixture = [
    name: string,
    bytes: number,
    docs: number,
    disabled: boolean,
];

export const CAPTURE_STREAMS: StreamFixture[] = [
    ['applications', 262_000_000, 1_418_000, false],
    ['candidates', 171_400_000, 963_000, false],
    ['scorecards', 96_300_000, 214_000, false],
    ['activity_feed', 71_800_000, 1_104_000, false],
    ['application_stages', 54_900_000, 486_000, false],
    ['interviews', 43_100_000, 121_000, false],
    ['scheduled_interviews', 38_600_000, 97_400, false],
    ['job_posts', 27_400_000, 18_600, false],
    ['jobs', 24_900_000, 15_200, false],
    ['offers', 19_700_000, 41_800, false],
    ['users', 14_300_000, 9_800, false],
    ['job_stages', 11_900_000, 26_400, false],
    ['custom_fields', 9_600_000, 7_100, false],
    ['applied_candidate_tags', 8_400_000, 132_000, false],
    ['job_openings', 7_300_000, 22_900, false],
    ['email_templates', 5_100_000, 640, false],
    ['departments', 4_200_000, 1_180, false],
    ['offices', 3_600_000, 410, false],
    ['sources', 2_900_000, 780, false],
    ['rejection_reasons', 2_400_000, 320, false],
    ['approval_flows', 2_100_000, 4_600, false],
    ['approver_groups', 1_800_000, 2_900, false],
    ['tags', 1_500_000, 1_240, false],
    ['close_reasons', 1_200_000, 190, false],
    ['prospect_pools', 980_000, 260, false],
    ['demographic_questions', 760_000, 88, false],
    ['eeoc', 0, 0, false],
    ['offer_custom_fields', 0, 0, false],
    ['candidate_survey_responses', 0, 0, true],
    ['hiring_team_history', 0, 0, true],
    ['job_stage_history', 0, 0, true],
];

// 12 bindings so the default 10-per-page pagination kicks in, with every status
// landing on the first page: `job_openings` is disabled but carries real
// volume, `eeoc` is enabled with none.
export const MIXED_STATUS_STREAMS: StreamFixture[] = [
    ['applications', 262_000_000, 1_418_000, false],
    ['candidates', 171_400_000, 963_000, false],
    ['scorecards', 96_300_000, 214_000, false],
    ['activity_feed', 71_800_000, 1_104_000, false],
    ['application_stages', 54_900_000, 486_000, false],
    ['interviews', 43_100_000, 121_000, false],
    ['scheduled_interviews', 38_600_000, 97_400, false],
    ['job_openings', 30_000_000, 41_200, true],
    ['job_posts', 27_400_000, 18_600, false],
    ['eeoc', 0, 0, false],
    ['hiring_team_history', 0, 0, true],
    ['job_stage_history', 0, 0, true],
];

// Recency modelled on `estuary/hubspot-native`, which runs its busiest bindings
// at the reporting floor while the rest trail off.
//
// Bounded to just inside the stories' default six-hour range: a capture stamps
// this field when it publishes, so its value always falls within the interval
// reporting it.
const LAST_PUBLISHED_CEILING_SECONDS = 5.5 * 3600;

const lastPublishedFor = (index: number, bytes: number): string | undefined => {
    if (bytes === 0) {
        return undefined;
    }

    const secondsAgo = Math.min(
        LAST_PUBLISHED_CEILING_SECONDS,
        index < 4 ? 270 + index * 90 : 900 * index
    );

    return new Date(Date.now() - secondsAgo * 1000).toISOString();
};

// Built through the real join so the story exercises buildBindingRows rather
// than hand-rolling row objects that could drift from it.
export const buildCaptureRows = (streams: StreamFixture[]): BindingRow[] =>
    buildBindingRows(
        streams.map(([stream, _bytes, _docs, disable]) => ({
            ...(disable ? { disable: true } : {}),
            resource: { schema: 'public', stream },
            target: `${PREFIX}/${stream}`,
        })),
        // One interval, because the fixture's numbers are the window totals.
        [
            {
                capture: Object.fromEntries(
                    streams.map(([stream, bytes, docs], index) => [
                        `${PREFIX}/${stream}`,
                        {
                            out: { bytesTotal: bytes, docsTotal: docs },
                            lastPublishedAt: lastPublishedFor(index, bytes),
                        },
                    ])
                ),
            },
        ],
        'capture'
    );

export const buildMaterializationRows = (
    streams: StreamFixture[]
): BindingRow[] =>
    buildBindingRows(
        streams.map(([stream, _bytes, _docs, disable]) => ({
            ...(disable ? { disable: true } : {}),
            resource: { table: stream },
            source: `${PREFIX}/${stream}`,
        })),
        [
            {
                materialize: Object.fromEntries(
                    streams.map(([stream, bytes, docs], index) => [
                        `${PREFIX}/${stream}`,
                        // `out` is deliberately wrong here: if the table ever
                        // reads it instead of `right`, these stories show 999 B.
                        {
                            out: { bytesTotal: 999, docsTotal: 999 },
                            right: { bytesTotal: bytes * 16, docsTotal: docs },
                            // A materialization stamps the source document it
                            // processed, under a different key — if the join
                            // ever reads the capture key here, Last data goes
                            // blank across the whole materialization story.
                            lastSourcePublishedAt: lastPublishedFor(
                                index,
                                bytes
                            ),
                        },
                    ])
                ),
            },
        ],
        'materialization'
    );

// Three backlog tiers cycled by index: caught up, roughly an hour behind, and
// roughly a day behind. Scaled off each binding's own window volume, so the
// figure tracks its throughput rather than being tiny beside a busy stream and
// huge beside a quiet one.
const BYTES_BEHIND_MULTIPLIER_BY_TIER = [0, 1, 24];

const bytesBehindFor = (index: number, bytes: number): number =>
    Math.round(bytes * BYTES_BEHIND_MULTIPLIER_BY_TIER[index % 3]);

// Matches the byte tiers in spirit, not in ratio: both come from the same gauge
// but are not required to move together.
const SECONDS_BEHIND_BY_TIER = [0, 3 * 3600, 2 * 86400];

const secondsBehindFor = (index: number): number =>
    SECONDS_BEHIND_BY_TIER[index % 3];

// The same shape `useMaterializationBacklog` hands to `attachBacklogReadings`,
// so the story exercises the real join.
const buildBacklogReadings = (
    streams: StreamFixture[]
): { backlog: MaterializationBacklog; timeLag: MaterializationTimeLag } => {
    const bindings = streams.map(([stream, bytes], index) => ({
        collectionName: `${PREFIX}/${stream}`,
        bytesBehind: bytesBehindFor(index, bytes),
        lastSourcePublishedAt: '',
    }));

    const timeLagBindings = streams.map(([stream], index) => ({
        collectionName: `${PREFIX}/${stream}`,
        seconds: secondsBehindFor(index),
    }));

    return {
        backlog: {
            bindings,
            bytesBehind: bindings.reduce(
                (sum, { bytesBehind }) => sum + bytesBehind,
                0
            ),
            ts: new Date().toISOString(),
        },
        timeLag: {
            bindings: timeLagBindings,
            seconds: Math.max(0, ...timeLagBindings.map((b) => b.seconds)),
        },
    };
};

// Lag readings attached through `attachBacklogReadings`, as the page does,
// rather than set by hand.
export const buildMaterializationRowsWithBacklog = (
    streams: StreamFixture[]
): BindingRow[] => {
    const rows = buildMaterializationRows(streams);
    const { backlog, timeLag } = buildBacklogReadings(streams);

    return attachBacklogReadings(rows, backlog, timeLag);
};

const LARGE_TASK_BINDING_COUNT = 1200;

export const buildLargeTaskStreams = (): StreamFixture[] =>
    Array.from({ length: LARGE_TASK_BINDING_COUNT }, (_value, index) => [
        `table_${String(index).padStart(4, '0')}`,
        // Deterministic but uneven, with a long tail of exact zeroes so paging
        // depends on the tie-break path.
        index % 7 === 0 ? 0 : (index % 97) * 1_100_000,
        index % 7 === 0 ? 0 : (index % 89) * 900,
        index % 11 === 0,
    ]);

// ── Harness ──────────────────────────────────────────────────────────

interface HarnessProps {
    bindings: BindingRow[];
    entityType: Entity;
    // Pins the window a story shows. Left off, the store answers, as on the
    // page.
    range?: DataByHourRange;
    // Renders the state the table is in between selecting a range and its
    // volumes arriving.
    volumesLoading?: boolean;
    // Renders the placeholder rows shown before the spec itself has resolved.
    specLoading?: boolean;
}

// Renders the production `BindingsCard` itself; only the data fetch is replaced
// by fixtures, so a story cannot show behaviour the app does not have.
export function BindingsHarness({
    bindings,
    entityType,
    range,
    specLoading = false,
    volumesLoading = false,
}: HarnessProps) {
    const storeRange = useDetailsUsageStore((state) => state.range);

    return (
        <EntityContextProvider value={entityType}>
            <BindingsCard
                bindings={bindings}
                range={range ?? storeRange}
                specLoading={specLoading}
                volumesLoading={volumesLoading}
            />
        </EntityContextProvider>
    );
}
