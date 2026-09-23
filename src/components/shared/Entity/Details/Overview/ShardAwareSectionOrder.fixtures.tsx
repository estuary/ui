import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { ReactNode } from 'react';
import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

import { useEffect } from 'react';

import { Grid } from '@mui/material';

import { ShardAwareSectionOrder } from 'src/components/shared/Entity/Details/Overview/ShardAwareSectionOrder';
import ShardInformation from 'src/components/shared/Entity/Shard/Information';
import { EntityContextProvider } from 'src/context/EntityContext';
import { ZustandProvider } from 'src/context/Zustand/provider';
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
export function ShardAwareSectionOrderHarness(props: HarnessProps) {
    return (
        <ZustandProvider>
            <EntityContextProvider value="capture">
                <ShardAwareSectionOrderContent {...props} />
            </EntityContextProvider>
        </ZustandProvider>
    );
}
