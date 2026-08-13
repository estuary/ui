import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { ReactNode } from 'react';
import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

import { useEffect } from 'react';

import { Grid } from '@mui/material';

import ShardAwareSectionOrder from 'src/components/shared/Entity/Details/Overview/ShardAwareSectionOrder';
import ShardInformation from 'src/components/shared/Entity/Shard/Information';
import { EntityContextProvider } from 'src/context/EntityContext';
import { ZustandProvider } from 'src/context/Zustand/provider';
import {
    useShardDetail_setDictionaryHydrated,
    useShardDetail_setShards,
} from 'src/stores/ShardDetail/hooks';

export const TASK_NAME = 'acmeco/recruiting/hello-world';

export type ShardStatusCode =
    | 'FAILED'
    | 'PRIMARY'
    | 'IDLE'
    | 'STANDBY'
    | 'BACKFILL';

// Only the fields `getEverythingForDictionary` (src/stores/ShardDetail/Store.ts)
// actually reads to color-code a shard — real `Shard` objects carry far more
// than this, but a story fixture only needs to drive that one function's
// branches the same way a real one would.
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

// `EntityContextProvider` wraps this rather than living inside it: the
// hooks below (`useShardDetail_setShards` among them) resolve which store to
// read/write via `useEntityType`, so the provider has to be an ancestor
// before they run, not a descendant of the component that calls them.
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
 * Seeds the real `ShardDetail` store directly with one fake shard — the same
 * store `ShardHydrator` fills from a websocket in the app — then renders the
 * production `ShardAwareSectionOrder` with real `ShardInformation`, reading
 * "needs attention" the same way `Overview/index.tsx` does. Only
 * `taskSections` is a stand-in, since a story shouldn't need the network
 * Bindings' own data fetch would otherwise require.
 */
export function ShardAwareSectionOrderHarness(props: HarnessProps) {
    return (
        <ZustandProvider>
            <EntityContextProvider value="capture">
                <ShardAwareSectionOrderContent {...props} />
            </EntityContextProvider>
        </ZustandProvider>
    );
}
