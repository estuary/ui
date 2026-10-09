import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { ReactNode } from 'react';
import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

import { useEffect } from 'react';

import { Box, Grid, Typography } from '@mui/material';

import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import { ShardAwareSectionOrder } from 'src/components/shared/Entity/Details/Overview/ShardAwareSectionOrder';
import ShardInformation from 'src/components/shared/Entity/Shard/Information';
import { EntityContextProvider } from 'src/context/EntityContext';
import { ZustandProvider } from 'src/context/Zustand/provider';
import enUSMessages from 'src/lang/en-US';
import {
    useShardDetail_setDictionaryHydrated,
    useShardDetail_setShards,
} from 'src/stores/ShardDetail/hooks';

const TASK_NAME = 'acmeco/recruiting/hello-world';

type ShardStatusCode = 'FAILED' | 'PRIMARY' | 'IDLE' | 'STANDBY' | 'BACKFILL';

// Only the fields `getEverythingForDictionary`
// (src/stores/ShardDetail/Store.ts) reads to colour-code a shard.
const buildShard = (code: ShardStatusCode): Shard =>
    ({
        spec: {
            id: `${TASK_NAME}/capture/00`,
            labels: {
                labels: [
                    { name: 'estuary.dev/task-name', value: TASK_NAME },
                    { name: 'estuary.dev/task-type', value: 'capture' },
                ],
            },
        },
        status: [{ code }],
    }) as unknown as Shard;

const TASK_TYPES: ShardEntityTypes[] = ['capture'];

interface HarnessProps {
    code: ShardStatusCode;
    taskSections: ReactNode;
}

// `EntityContextProvider` wraps this rather than living inside it: the hooks
// below resolve which store to use via `useEntityType`, so it has to be an
// ancestor before they run.
function ShardAwareSectionOrderContent({ code, taskSections }: HarnessProps) {
    const setShards = useShardDetail_setShards();
    const setHydrated = useShardDetail_setDictionaryHydrated();

    useEffect(() => {
        setShards([buildShard(code)]);
        setHydrated(true);
    }, [code, setHydrated, setShards]);

    return (
        <Grid container spacing={2}>
            <ShardAwareSectionOrder
                shardInformation={
                    <Grid size={{ xs: 12 }}>
                        <ShardInformation
                            taskName={TASK_NAME}
                            taskTypes={TASK_TYPES}
                        />
                    </Grid>
                }
                taskName={TASK_NAME}
                taskSections={taskSections}
                taskTypes={TASK_TYPES}
            />
        </Grid>
    );
}

/**
 * Seeds the real `ShardDetail` store with one fake shard, then renders the
 * production `ShardAwareSectionOrder` with real `ShardInformation`. Only
 * `taskSections` is a stand-in, so a story needs no network.
 */
function ShardAwareSectionOrderHarness(props: HarnessProps) {
    return (
        <ZustandProvider>
            <EntityContextProvider value="capture">
                <ShardAwareSectionOrderContent {...props} />
            </EntityContextProvider>
        </ZustandProvider>
    );
}

// Stands in for the rest of the Overview tab; only its position matters here.
const BINDINGS = (
    <Grid size={{ xs: 12 }}>
        <Box
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 3,
            }}
        >
            <Typography>Bindings</Typography>
        </Box>
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

/** A failed shard: Shard Information jumps above the bindings. */
export const NeedsAttention: Story = {
    render: () => (
        <ShardAwareSectionOrderHarness taskSections={BINDINGS} code="FAILED" />
    ),
};

/**
 * A backfilling shard: non-primary but not a hard failure, so
 * `shardsHaveErrors`/`shardsHaveWarnings` both read false. The card still
 * moves up — see `ShardAwareSectionOrder`.
 */
export const Backfilling: Story = {
    render: () => (
        <ShardAwareSectionOrderHarness
            taskSections={BINDINGS}
            code="BACKFILL"
        />
    ),
};
