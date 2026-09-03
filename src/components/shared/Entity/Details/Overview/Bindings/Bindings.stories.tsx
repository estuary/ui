import type { Meta, StoryObj } from '@storybook/react-vite';

import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import { DataGrains } from 'src/components/graphs/types';
import {
    BindingsHarness,
    buildCaptureRows,
    buildLargeTaskStreams,
    buildMaterializationRows,
    buildMaterializationRowsWithBacklog,
    CAPTURE_STREAMS,
    MIXED_STATUS_STREAMS,
} from 'src/components/shared/Entity/Details/Overview/Bindings/Bindings.fixtures';
import enUSMessages from 'src/lang/en-US';

// ── Meta ─────────────────────────────────────────────────────────────

const meta: Meta<typeof BindingsHarness> = {
    title: 'Details/Bindings',
    component: BindingsHarness,
    decorators: [
        (Story: React.ComponentType) => (
            <IntlProvider locale="en" messages={enUSMessages}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </IntlProvider>
        ),
    ],
    parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof BindingsHarness>;

// ── Stories ──────────────────────────────────────────────────────────

/** Five columns: the source stream leads, because that is the name a customer reports. */
export const Capture: Story = {
    render: () => (
        <BindingsHarness
            bindings={buildCaptureRows(CAPTURE_STREAMS)}
            entityType="capture"
        />
    ),
};

/** Four columns — a materialization's binding is the collection, so there is no second name. */
export const Materialization: Story = {
    render: () => (
        <BindingsHarness
            bindings={buildMaterializationRows(CAPTURE_STREAMS)}
            entityType="materialization"
        />
    ),
};

/**
 * The two lag columns, materialization-only. Every third row cycles through a
 * caught-up binding (a literal 0 reading, rendered as "Caught up" rather than
 * a blank — every stream here has a reading, so the "no reading yet" dash
 * never shows), a moderately-behind one (about an hour of bytes, a few hours
 * of source time), and a heavily-behind one (about a day of bytes, a couple
 * of days of source time) — see `buildMaterializationRowsWithBacklog` for
 * exactly how each tier is derived.
 */
export const MaterializationBacklog: Story = {
    render: () => (
        <BindingsHarness
            bindings={buildMaterializationRowsWithBacklog(CAPTURE_STREAMS)}
            entityType="materialization"
        />
    ),
};

/** A task with a single binding still has to read as a table. */
export const SingleBinding: Story = {
    render: () => (
        <BindingsHarness
            bindings={buildCaptureRows([CAPTURE_STREAMS[0]])}
            entityType="capture"
        />
    ),
};

/**
 * Every binding disabled — the case the old chip list rendered as an empty
 * field, because writes_to holds only enabled targets.
 */
export const NoneEnabled: Story = {
    render: () => (
        <BindingsHarness
            bindings={buildCaptureRows(
                CAPTURE_STREAMS.slice(0, 6).map(
                    ([stream, bytes, docs]) =>
                        [stream, bytes, docs, true] as [
                            string,
                            number,
                            number,
                            boolean,
                        ]
                )
            )}
            entityType="capture"
        />
    ),
};

/** A spec with no bindings at all. */
export const Empty: Story = {
    render: () => <BindingsHarness bindings={[]} entityType="capture" />,
};

/**
 * 12 bindings, so the default 10-per-page pagination actually kicks in —
 * and every status the table can show (enabled, disabled, no data) plus the
 * full range of bar lengths all land on that first page regardless, without
 * paging through to see it. `job_openings` is disabled but still carries a
 * real bar; `eeoc` is enabled with none.
 */
export const MixedStatusesOnePage: Story = {
    render: () => (
        <BindingsHarness
            bindings={buildCaptureRows(MIXED_STATUS_STREAMS)}
            entityType="capture"
        />
    ),
};

/**
 * 1200 bindings. Only a page is ever rendered, so this is the check that sorting
 * and paging the full set does not stall the page.
 */
export const LargeTask: Story = {
    render: () => (
        <BindingsHarness
            bindings={buildCaptureRows(buildLargeTaskStreams())}
            entityType="capture"
        />
    ),
};

/**
 * A wider range selected on the chart. The chip is the only thing that changes:
 * it takes its wording from the same message keys the picker uses, so the two
 * can never describe the same window differently.
 */
export const WiderRange: Story = {
    render: () => (
        <BindingsHarness
            bindings={buildCaptureRows(CAPTURE_STREAMS)}
            entityType="capture"
            range={{ amount: 30, grain: DataGrains.daily }}
        />
    ),
};

/**
 * Between picking a range and its volumes arriving. Names and statuses come from
 * the spec and stay put; only Docs and Data go to skeletons — and the rows hold
 * their existing order, so the table does not reshuffle and then reshuffle back.
 * On a task with a thousand bindings this is a real wait, not a flash.
 */
export const VolumesLoading: Story = {
    render: () => (
        <BindingsHarness
            bindings={buildCaptureRows(CAPTURE_STREAMS)}
            entityType="capture"
            range={{ amount: 30, grain: DataGrains.daily }}
            volumesLoading
        />
    ),
};
