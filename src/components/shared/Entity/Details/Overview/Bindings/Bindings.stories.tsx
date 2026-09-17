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
 * The two lag columns, materialization-only. Every third row cycles through
 * caught up, moderately behind and heavily behind.
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

/** Every binding disabled. */
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
 * 12 bindings, so pagination kicks in and every status the table can show lands
 * on the first page. `job_openings` is disabled but carries a real bar; `eeoc`
 * is enabled with none.
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
 * A wider range selected on the chart. The chip is the only thing that changes;
 * it words the range the same way the picker does.
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
 * Between picking a range and its volumes arriving. Names and statuses stay put;
 * only Docs and Data go to skeletons, and the rows hold their existing order.
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
