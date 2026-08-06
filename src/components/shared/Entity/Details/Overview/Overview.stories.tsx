import type { Meta, StoryContext, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import type { CatalogStats_Details, Entity } from 'src/types';

import { Grid, Stack, Typography } from '@mui/material';

import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { Client, Provider as UrqlProvider } from 'urql';

import { createEditorStore } from 'src/components/editor/Store/create';
import DataByHourGraph from 'src/components/graphs/DataByHourGraph';
import StatTypeSelector from 'src/components/graphs/DataByHourGraph/StatTypeSelector';
import { DataGrains } from 'src/components/graphs/types';
import CardWrapper from 'src/components/shared/CardWrapper';
import { DetailsPageContextProvider } from 'src/components/shared/Entity/Details/context';
import AlertsPanel from 'src/components/shared/Entity/Details/Overview/AlertsPanel';
import {
    BindingsHarness,
    buildCaptureRows,
    buildMaterializationRows,
    CAPTURE_STREAMS,
} from 'src/components/shared/Entity/Details/Overview/Bindings/Bindings.fixtures';
import { getTotalBytes } from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { OVERVIEW_CARD_TITLE_WEIGHT } from 'src/components/shared/Entity/Details/Overview/shared';
import {
    agoBySeconds,
    CAPTURE_NAME,
    captureSpec,
    MATERIALIZATION_NAME,
    materializationSpec,
    StripHarness,
} from 'src/components/shared/Entity/Details/Overview/StatusStrip/StatusStrip.fixtures';
import DetailTabs from 'src/components/shared/Entity/Details/Tabs';
import DetailsToolBar from 'src/components/shared/Entity/Details/ToolBar';
import { EntityContextProvider } from 'src/context/EntityContext';
import { LocalZustandProvider } from 'src/context/LocalZustand';
import { ZustandProvider } from 'src/context/Zustand/provider';
import enUSMessages from 'src/lang/en-US';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';
import { EditorStoreNames } from 'src/stores/names';

const HOURS = 48;

// Despite the name, LocalZustandProvider's `createStore` prop takes the store
// itself — it hands the value straight to `useStore`, which is why passing a
// factory throws "api.getState is not a function". Details/index.tsx passes a
// memoised store; this is the story's equivalent, at module scope so a
// re-rendered decorator does not build a new one.
const storyEditorStore = createEditorStore(EditorStoreNames.GENERAL);

// The tabs' alerts badge queries the control plane through urql, so the real
// DetailTabs needs a Provider to render at all. No exchanges: the contract is
// satisfied, no request leaves the story, and the badge stays in the quiet
// state every one of these stories wants anyway.
const storyUrqlClient = new Client({ exchanges: [], url: '/graphql' });

// Edit and Materialize render only once the live spec has an id.
storyEditorStore.setState({ specs: [{ id: 'story-live-spec-id' }] } as any);

// Hourly volume that dips overnight and climbs through the working day, so the
// chart reads like a real task's rather than as noise.
const buildStats = (
    scale: number,
    key: 'bytes_written' | 'bytes_read'
): CatalogStats_Details[] => {
    const start = Date.now() - (HOURS - 1) * 3_600_000;

    return Array.from({ length: HOURS }, (_value, index) => {
        const ts = new Date(start + index * 3_600_000);
        const diurnal =
            18 + 22 * Math.sin(((ts.getUTCHours() - 3) / 24) * Math.PI * 2);
        const value = Math.max(6, Math.round(diurnal + ((index * 13) % 9) - 4));

        return {
            catalog_name: CAPTURE_NAME,
            grain: DataGrains.hourly,
            ts: ts.toISOString(),
            [key]: value * scale,
            docs_written: value * 900,
            docs_read: value * 900,
        } as CatalogStats_Details;
    });
};

// Two at once on purpose: the banner this panel replaced could only ever show
// one error, so a task that had both failed and stalled read as though only one
// thing was wrong.
const FIRING_ALERTS = [
    {
        alertType: 'shard_failed',
        firedAt: new Date(Date.now() - 6 * 60_000).toISOString(),
        alertDetails: {
            error: 'shard failed: connector exited with code 1 after 6 restarts in the past hour',
            spec_type: 'capture',
        },
    },
    {
        alertType: 'data_movement_stalled',
        firedAt: new Date(Date.now() - 52 * 60_000).toISOString(),
        alertDetails: { error: null, spec_type: 'capture' },
    },
] as any;

interface PageProps {
    alertsPanel: ReactNode;
    bindings: ReactNode;
    entityType: Entity;
    stats: CatalogStats_Details[];
    strip: ReactNode;
}

/**
 * Stands in for the details page shell, which needs routing and hydration this
 * story does not set up. Only here so the strip and table can be reviewed with
 * the task name and tabs above them, the way they are actually seen.
 *
 * Everything below the page heading is the real thing, and the `gap` is the
 * same `spacing={2}` the shell uses, so the rhythm from the task name down to
 * the first card is the page's own.
 */
function PageHeader({ entityType }: { entityType: Entity }) {
    return (
        <Stack sx={{ gap: 2, mb: 2 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                {entityType === 'capture'
                    ? 'Capture Details'
                    : 'Materialization Details'}
            </Typography>

            {/* The real toolbar and the real tabs, not lookalikes. Both have
                changed on this branch — the range picker moved into the toolbar
                and the tabs became pills — and a hand-rolled copy of either
                shows the design as it was before the change while looking as
                though it is showing the change. That already produced one
                "where did Edit go?". */}
            <DetailsToolBar />

            <DetailTabs />
        </Stack>
    );
}

// The same Grid and spacing as Overview/index.tsx, so the vertical rhythm
// between the strip, the chart and the table is the real one.
function OverviewPage({
    alertsPanel,
    bindings,
    entityType,
    stats,
    strip,
}: PageProps) {
    return (
        <EntityContextProvider value={entityType}>
            <PageHeader entityType={entityType} />

            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>{strip}</Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    {/* The real Usage card header: the "Data Movement" heading
                        and its range picker come from DetailsRange, and the
                        bytes/docs toggle from StatTypeSelector. */}
                    <CardWrapper
                        disableMinWidth
                        message={
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}
                            >
                                <Typography
                                    component="div"
                                    sx={{
                                        fontWeight: OVERVIEW_CARD_TITLE_WEIGHT,
                                    }}
                                >
                                    Data Movement
                                </Typography>

                                <StatTypeSelector />
                            </Stack>
                        }
                    >
                        <DataByHourGraph
                            id={`overview-story-${entityType}`}
                            stats={stats}
                        />
                    </CardWrapper>
                </Grid>

                <Grid
                    size={{ xs: 12, md: 4 }}
                    sx={{ order: { xs: -1, md: 0 } }}
                >
                    {alertsPanel}
                </Grid>

                <Grid size={{ xs: 12 }}>{bindings}</Grid>
            </Grid>
        </EntityContextProvider>
    );
}

const meta: Meta = {
    title: 'Details/Overview page',
    decorators: [
        (Story: React.ComponentType, context: StoryContext) => {
            // The graph takes its grain and stat type from this store.
            useDetailsUsageStore.setState({
                range: { amount: HOURS, grain: DataGrains.hourly },
                statType: 'bytes',
            });

            return (
                <IntlProvider locale="en" messages={enUSMessages}>
                    {/* The toolbar takes the task name from the query string,
                        so each story supplies its own — otherwise the
                        materialization story renders the capture's name under a
                        "Materialization Details" heading. */}
                    <MemoryRouter
                        initialEntries={[
                            `/details/overview?catalogName=${encodeURIComponent(
                                context.parameters.catalogName ?? CAPTURE_NAME
                            )}`,
                        ]}
                    >
                        <UrqlProvider value={storyUrqlClient}>
                            <ZustandProvider>
                                {/* What DetailsToolBar reads: catalog name from
                                the query string above, spec id from this store,
                                and the overview tab for the range picker. */}
                                <LocalZustandProvider
                                    createStore={storyEditorStore}
                                >
                                    <DetailsPageContextProvider value="overview">
                                        <Story />
                                    </DetailsPageContextProvider>
                                </LocalZustandProvider>
                            </ZustandProvider>
                        </UrqlProvider>
                    </MemoryRouter>
                </IntlProvider>
            );
        },
    ],
    parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

/** The whole capture Overview tab: status strip, usage chart, bindings. */
export const Capture: Story = {
    render: () => {
        const rows = buildCaptureRows(CAPTURE_STREAMS);

        return (
            <OverviewPage
                entityType="capture"
                stats={buildStats(5_600_000, 'bytes_written')}
                alertsPanel={
                    <AlertsPanel alerts={[]} entityName={CAPTURE_NAME} />
                }
                strip={
                    <StripHarness
                        totalBytes={getTotalBytes(rows)}
                        entityName={CAPTURE_NAME}
                        entityType="capture"
                        lastPublishedAt={agoBySeconds(285)}
                        latestLiveSpec={captureSpec}
                    />
                }
                bindings={
                    <BindingsHarness bindings={rows} entityType="capture" />
                }
            />
        );
    },
};

/** The materialization Overview tab. */
export const Materialization: Story = {
    parameters: { catalogName: MATERIALIZATION_NAME },
    render: () => {
        const rows = buildMaterializationRows(CAPTURE_STREAMS);

        return (
            <OverviewPage
                entityType="materialization"
                stats={buildStats(89_000_000, 'bytes_read')}
                alertsPanel={
                    <AlertsPanel
                        alerts={[]}
                        entityName={MATERIALIZATION_NAME}
                    />
                }
                strip={
                    <StripHarness
                        totalBytes={getTotalBytes(rows)}
                        entityName={MATERIALIZATION_NAME}
                        entityType="materialization"
                        lastPublishedAt={agoBySeconds(1860)}
                        latestLiveSpec={materializationSpec}
                    />
                }
                bindings={
                    <BindingsHarness
                        bindings={rows}
                        entityType="materialization"
                    />
                }
            />
        );
    },
};

/**
 * A capture with alerts firing.
 *
 * The alerts panel is the only always-absent piece of this page, so without a
 * story it would never be seen: it renders solely while something is firing,
 * and the dev stack's tasks are healthy. Note the chart giving up a third of
 * the row — and taking it back in every other story.
 */
export const CaptureWithFiringAlerts: Story = {
    render: () => {
        const rows = buildCaptureRows(CAPTURE_STREAMS);

        return (
            <OverviewPage
                entityType="capture"
                stats={buildStats(5_600_000, 'bytes_written')}
                alertsPanel={
                    <AlertsPanel
                        alerts={FIRING_ALERTS}
                        entityName={CAPTURE_NAME}
                    />
                }
                strip={
                    <StripHarness
                        totalBytes={getTotalBytes(rows)}
                        entityName={CAPTURE_NAME}
                        entityType="capture"
                        lastPublishedAt={agoBySeconds(285)}
                        latestLiveSpec={captureSpec}
                        shardStatus="failed"
                    />
                }
                bindings={
                    <BindingsHarness bindings={rows} entityType="capture" />
                }
            />
        );
    },
};
