import type { DataByHourRange } from 'src/components/graphs/types';
import type {
    BindingRow,
    BindingsFilterState,
    BindingSortKey,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { Entity, SortDirection } from 'src/types';

import { useMemo, useState } from 'react';

import CardWrapper from 'src/components/shared/CardWrapper';
import BindingsCardHeader from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsCardHeader';
import BindingsTable from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsTable';
import BindingsToolbar from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsToolbar';
import {
    buildBindingRows,
    countBindings,
    DEFAULT_BINDINGS_PER_PAGE,
    filterBindings,
    sortBindings,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { EntityContextProvider } from 'src/context/EntityContext';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

// ── Fixtures ─────────────────────────────────────────────────────────
//
// Stream names are the Greenhouse connector's public API surface; the tenant is
// a placeholder and every volume is synthetic.

export const PREFIX = 'acmeco/recruiting';

export const CAPTURE_STREAMS: [string, number, number, boolean][] = [
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

// Recency modelled on a real production capture: `estuary/hubspot-native` runs
// its busiest bindings at the reporting floor while the rest trail off. That
// spread is the reason the strip takes the maximum rather than an average — the
// mean of the real task reads 9.1 hours while it is perfectly current.
//
// Bounded to just inside the stories' default six-hour range. A capture stamps
// this field when it publishes, so its value always falls within the interval
// reporting it: a story showing a capture binding three days old under a
// "6 hours" chip would be showing a state the app cannot reach.
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
export const buildCaptureRows = (
    streams: [string, number, number, boolean][]
): BindingRow[] =>
    buildBindingRows(
        streams.map(([stream, _bytes, _docs, disable]) => ({
            ...(disable ? { disable: true } : {}),
            resource: { schema: 'public', stream },
            target: `${PREFIX}/${stream}`,
        })),
        // One interval, because the fixture's numbers are the window totals.
        // Summing across intervals is covered by the unit tests instead.
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
    streams: [string, number, number, boolean][]
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

export const LARGE_TASK_BINDING_COUNT = 1200;

export const buildLargeTaskStreams = (): [string, number, number, boolean][] =>
    Array.from({ length: LARGE_TASK_BINDING_COUNT }, (_value, index) => [
        `table_${String(index).padStart(4, '0')}`,
        // Deterministic but uneven, and a long tail of exact zeroes so the
        // tie-break path is what paging actually depends on.
        index % 7 === 0 ? 0 : (index % 97) * 1_100_000,
        index % 7 === 0 ? 0 : (index % 89) * 900,
        index % 11 === 0,
    ]);

// ── Harness ──────────────────────────────────────────────────────────

interface HarnessProps {
    bindings: BindingRow[];
    entityType: Entity;
    // Pins the window a story shows. Left off, the store answers, which is what
    // the page does — so the whole-page story's real range picker drives the
    // chip here the way it drives the chart.
    range?: DataByHourRange;
    // Renders the state the table is in between selecting a range and its
    // volumes arriving.
    volumesLoading?: boolean;
}

// Mirrors the state wiring in Bindings/index.tsx. The components below it, and
// therefore everything rendered, are the production ones; only the data fetch is
// replaced by fixtures.
export function BindingsHarness({
    bindings,
    entityType,
    range,
    volumesLoading = false,
}: HarnessProps) {
    const storeRange = useDetailsUsageStore((state) => state.range);
    const effectiveRange = range ?? storeRange;

    const [filter, setFilter] = useState<BindingsFilterState>({
        query: '',
        status: 'all',
    });
    const [sortKey, setSortKey] = useState<BindingSortKey>('bytes');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_BINDINGS_PER_PAGE);

    const counts = useMemo(() => countBindings(bindings), [bindings]);

    const sortedRows = useMemo(
        () =>
            sortBindings(
                filterBindings(bindings, filter),
                sortKey,
                sortDirection
            ),
        [bindings, filter, sortDirection, sortKey]
    );

    const visibleRows = useMemo(
        () =>
            sortedRows.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            ),
        [page, rowsPerPage, sortedRows]
    );

    const { maxBytes, totalBytes } = useMemo(
        () =>
            bindings.reduce(
                (accumulated, row) => ({
                    maxBytes: Math.max(accumulated.maxBytes, row.bytes),
                    totalBytes: accumulated.totalBytes + row.bytes,
                }),
                { maxBytes: 0, totalBytes: 0 }
            ),
        [bindings]
    );

    return (
        <EntityContextProvider value={entityType}>
            <CardWrapper
                // Matches Bindings/index.tsx — without it the card inherits the
                // table's minWidth and the overflow escapes the scroll container.
                disableMinWidth
                message={
                    <BindingsCardHeader
                        count={counts.all}
                        entityType={entityType}
                        loading={volumesLoading}
                        range={effectiveRange}
                        totalBytes={totalBytes}
                    />
                }
            >
                <BindingsToolbar
                    counts={counts}
                    filter={filter}
                    searchLabelId={
                        entityType === 'materialization'
                            ? 'detailsPanel.bindings.search.materialization'
                            : 'detailsPanel.bindings.search.capture'
                    }
                    setFilter={(update) => {
                        setFilter(update);
                        setPage(0);
                    }}
                />

                <BindingsTable
                    entityType={entityType}
                    maxBytes={maxBytes}
                    totalBytes={totalBytes}
                    onPageChange={setPage}
                    onRowsPerPageChange={(next) => {
                        setRowsPerPage(next);
                        setPage(0);
                    }}
                    onSortChange={(nextKey) => {
                        if (nextKey === sortKey) {
                            setSortDirection(
                                sortDirection === 'asc' ? 'desc' : 'asc'
                            );
                        } else {
                            setSortKey(nextKey);
                            setSortDirection(
                                nextKey === 'collection' ||
                                    nextKey === 'resourcePath'
                                    ? 'asc'
                                    : 'desc'
                            );
                        }
                        setPage(0);
                    }}
                    page={page}
                    rows={sortedRows}
                    rowsPerPage={rowsPerPage}
                    sortDirection={sortDirection}
                    sortKey={sortKey}
                    totalBindings={counts.all}
                    visibleRows={visibleRows}
                    volumesLoading={volumesLoading}
                />
            </CardWrapper>
        </EntityContextProvider>
    );
}
