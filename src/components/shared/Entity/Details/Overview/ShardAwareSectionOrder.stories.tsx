import type { Meta, StoryObj } from '@storybook/react-vite';

import { Grid } from '@mui/material';

import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import {
    BindingsHarness,
    buildCaptureRows,
    CAPTURE_STREAMS,
} from 'src/components/shared/Entity/Details/Overview/Bindings/Bindings.fixtures';
import { ShardAwareSectionOrderHarness } from 'src/components/shared/Entity/Details/Overview/ShardAwareSectionOrder.fixtures';
import enUSMessages from 'src/lang/en-US';

const BINDINGS = (
    <Grid size={{ xs: 12 }}>
        <BindingsHarness
            bindings={buildCaptureRows(CAPTURE_STREAMS.slice(0, 6))}
            entityType="capture"
        />
    </Grid>
);

const meta: Meta<typeof ShardAwareSectionOrderHarness> = {
    title: 'Details/Overview/ShardAwareSectionOrder',
    component: ShardAwareSectionOrderHarness,
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

type Story = StoryObj<typeof ShardAwareSectionOrderHarness>;

/** A running task: Shard Information stays below the bindings, its usual spot. */
export const Healthy: Story = {
    render: () => (
        <ShardAwareSectionOrderHarness taskSections={BINDINGS} code="PRIMARY" />
    ),
};

/**
 * A failed shard. Shard Information jumps above the bindings — the thing
 * people actually check during an incident shouldn't need a scroll past a
 * six-row table to find.
 */
export const NeedsAttention: Story = {
    render: () => (
        <ShardAwareSectionOrderHarness taskSections={BINDINGS} code="FAILED" />
    ),
};

/**
 * A backfilling shard — non-primary and worth surfacing, but not a hard
 * failure. `shardsHaveErrors`/`shardsHaveWarnings` would both read false
 * here (see `useShardStatusNeedsAttention`), which is exactly the gap that
 * hook closes: the card still moves up.
 */
export const Backfilling: Story = {
    render: () => (
        <ShardAwareSectionOrderHarness
            taskSections={BINDINGS}
            code="BACKFILL"
        />
    ),
};
