import type { Meta, StoryObj } from '@storybook/react-vite';

import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import {
    agoBySeconds,
    CAPTURE_NAME,
    captureSpec,
    MATERIALIZATION_NAME,
    materializationSpec,
    StripHarness,
} from 'src/components/shared/Entity/Details/Overview/StatusStrip/StatusStrip.fixtures';
import { ZustandProvider } from 'src/context/Zustand/provider';
import enUSMessages from 'src/lang/en-US';

// ── Meta ─────────────────────────────────────────────────────────────

const meta: Meta<typeof StripHarness> = {
    title: 'Details/StatusStrip',
    component: StripHarness,
    decorators: [
        (Story: React.ComponentType) => (
            <IntlProvider locale="en" messages={enUSMessages}>
                <MemoryRouter>
                    <ZustandProvider>
                        <Story />
                    </ZustandProvider>
                </MemoryRouter>
            </IntlProvider>
        ),
    ],
    parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof StripHarness>;

// ── Stories ──────────────────────────────────────────────────────────

/** Healthy capture: freshness, collection count, auto-discover, status. */
export const Capture: Story = {
    render: () => (
        <StripHarness
            totalBytes={931_000_000}
            entityName={CAPTURE_NAME}
            entityType="capture"
            lastPublishedAt={agoBySeconds(285)}
            latestLiveSpec={captureSpec}
        />
    ),
};

/** A failing task: the status text is itself the link into Alerts. */
export const CaptureFailing: Story = {
    render: () => (
        <StripHarness
            autoDiscoverFailing
            totalBytes={931_000_000}
            entityName={CAPTURE_NAME}
            entityType="capture"
            lastPublishedAt={agoBySeconds(285)}
            latestLiveSpec={captureSpec}
            shardStatus="failed"
        />
    ),
};

/**
 * No freshness cell: a materialization has no per-binding or task-level
 * timestamp with a reduce strategy, so its sync schedule is reported instead.
 */
export const Materialization: Story = {
    render: () => (
        <StripHarness
            totalBytes={14_210_000_000}
            entityName={MATERIALIZATION_NAME}
            entityType="materialization"
            latestLiveSpec={materializationSpec}
        />
    ),
};

/** A capture whose enabled bindings have never moved data. */
export const NoDataYet: Story = {
    render: () => (
        <StripHarness
            totalBytes={0}
            entityName={CAPTURE_NAME}
            entityType="capture"
            lastPublishedAt={agoBySeconds(285)}
            latestLiveSpec={captureSpec}
        />
    ),
};
