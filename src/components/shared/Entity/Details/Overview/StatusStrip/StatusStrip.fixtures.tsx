import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';
import type { Entity } from 'src/types';
import type { EntityStatusResponse } from 'src/types/controlPlane';

import { useEffect, useState } from 'react';

import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import { getElapsed } from 'src/components/shared/Entity/Details/Overview/shared';
import AutoDiscoverCell from 'src/components/shared/Entity/Details/Overview/StatusStrip/AutoDiscoverCell';
import HeroValue from 'src/components/shared/Entity/Details/Overview/StatusStrip/HeroValue';
import {
    getStripGridSx,
    getSyncFrequency,
} from 'src/components/shared/Entity/Details/Overview/StatusStrip/shared';
import StripCell from 'src/components/shared/Entity/Details/Overview/StatusStrip/StripCell';
import StripFooter from 'src/components/shared/Entity/Details/Overview/StatusStrip/StripFooter';
import TaskStatusCell from 'src/components/shared/Entity/Details/Overview/StatusStrip/TaskStatusCell';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import { EntityContextProvider } from 'src/context/EntityContext';
import invariableStores from 'src/context/Zustand/invariableStores';
import { useEntityStatusStore } from 'src/stores/EntityStatus/Store';
import { ShardDetailStoreNames } from 'src/stores/names';
import { ShardStatusMessageIds } from 'src/stores/ShardDetail/types';

// ── Fixtures ─────────────────────────────────────────────────────────

export const CAPTURE_NAME = 'acmeco/recruiting/source-greenhouse-native';
export const MATERIALIZATION_NAME = 'acmeco/warehouse/materialize-snowflake';

export const agoBySeconds = (seconds: number) =>
    new Date(Date.now() - seconds * 1000).toISOString();

export const captureSpec = {
    connectorName: 'PostgreSQL',
    connector_logo_url: '',
    connector_tag_documentation_url:
        'https://docs.estuary.dev/reference/Connectors/capture-connectors/PostgreSQL/',
    created_at: '2024-02-13T18:34:46Z',
    data_plane_name: 'ops/dp/public/gcp-us-central1-c2',
    updated_at: '2025-09-11T19:47:30Z',
} as unknown as LiveSpecsQuery_details;

export const materializationSpec = {
    ...captureSpec,
    connectorName: 'Snowflake',
    spec: {
        endpoint: {
            connector: { config: { syncSchedule: { syncFrequency: '30m' } } },
        },
    },
} as unknown as LiveSpecsQuery_details;

// The two store-backed cells read singleton stores, so a story seeds them
// directly rather than standing up a fake transport.
// Long on purpose. Real messages carry backfill progress, and the whole reason
// connector status is a full-width line rather than a strip cell is that this
// kind of text truncates to nothing in a quarter-width column — so the fixture
// has to be long enough to actually hit the ellipsis.
const CONNECTOR_STATUS_MESSAGE =
    'Backfilling public.applications (3 of 12 tables); streaming change events for the remainder';

const seedStores = (
    catalogName: string,
    {
        autoDiscoverFailing,
        shardStatus,
    }: {
        autoDiscoverFailing?: boolean;
        shardStatus: 'primary' | 'failed';
    }
) => {
    useEntityStatusStore.setState({
        hydrated: true,
        responses: [
            {
                catalog_name: catalogName,
                spec_type: 'capture',
                connector_status: { message: CONNECTOR_STATUS_MESSAGE },
                controller_status: {
                    type: 'Capture',
                    auto_discover: {
                        next_at: new Date(Date.now() + 300_000).toISOString(),
                        ...(autoDiscoverFailing
                            ? {
                                  failure: {
                                      count: 3,
                                      first_ts: agoBySeconds(20_000),
                                      last_outcome: { ts: agoBySeconds(7_200) },
                                  },
                              }
                            : {
                                  last_success: { ts: agoBySeconds(7_200) },
                              }),
                    },
                },
            } as unknown as EntityStatusResponse,
        ],
    });

    invariableStores[ShardDetailStoreNames.CAPTURE].setState({
        shardDictionaryHydrated: true,
        shardDictionary: {
            [catalogName]: [
                {
                    color: shardStatus === 'failed' ? '#CA3B55' : '#40B763',
                    entityType: 'capture',
                    errors: shardStatus === 'failed' ? ['shard failed'] : [],
                    id: `capture/${catalogName}/00000000-00000000`,
                    messageId:
                        shardStatus === 'failed'
                            ? ShardStatusMessageIds.FAILED
                            : ShardStatusMessageIds.PRIMARY,
                    warnings: [],
                },
            ],
        },
    });

    invariableStores[ShardDetailStoreNames.MATERIALIZATION].setState({
        shardDictionaryHydrated: true,
        shardDictionary: {
            [catalogName]: [
                {
                    color: shardStatus === 'failed' ? '#CA3B55' : '#40B763',
                    entityType: 'materialization',
                    errors: shardStatus === 'failed' ? ['shard failed'] : [],
                    id: `materialize/${catalogName}/00000000-00000000`,
                    messageId:
                        shardStatus === 'failed'
                            ? ShardStatusMessageIds.FAILED
                            : ShardStatusMessageIds.PRIMARY,
                    warnings: [],
                },
            ],
        },
    });
};

// ── Harness ──────────────────────────────────────────────────────────

interface HarnessProps {
    entityName: string;
    // Everything the task moved over the range, as the strip's headline figure.
    totalBytes: number;
    entityType: Entity;
    // Stands in for the max across the task's bindings, which the page derives
    // from the same rows the table uses.
    lastPublishedAt?: string;
    latestLiveSpec: LiveSpecsQuery_details;
    shardStatus?: 'primary' | 'failed';
    autoDiscoverFailing?: boolean;
}

// Composes the same cells, in the same order, as StatusStrip/index.tsx. Every
// component below this point is the production one.
export function StripHarness({
    autoDiscoverFailing,
    entityName,
    entityType,
    lastPublishedAt,
    latestLiveSpec,
    shardStatus = 'primary',
    totalBytes,
}: HarnessProps) {
    const intl = useIntl();
    const [seeded, setSeeded] = useState(false);

    useEffect(() => {
        seedStores(entityName, { autoDiscoverFailing, shardStatus });
        setSeeded(true);
    }, [autoDiscoverFailing, entityName, shardStatus]);

    const isCapture = entityType !== 'materialization';
    const syncFrequency = getSyncFrequency(latestLiveSpec?.spec);
    const elapsed = lastPublishedAt ? getElapsed(lastPublishedAt) : null;

    if (!seeded) {
        return null;
    }

    return (
        <EntityContextProvider value={entityType}>
            {/* disableMinWidth matches StatusStrip/index.tsx. */}
            <CardWrapper disableMinWidth>
                <Box sx={getStripGridSx(isCapture ? 4 : 3)}>
                    <StripCell labelId="detailsPanel.strip.freshness">
                        {elapsed ? (
                            <HeroValue
                                note={
                                    syncFrequency
                                        ? intl.formatMessage(
                                              {
                                                  id: 'detailsPanel.strip.syncSchedule.inline',
                                              },
                                              { frequency: syncFrequency }
                                          )
                                        : undefined
                                }
                                unit={intl.formatMessage(
                                    { id: elapsed.unitLabelId },
                                    { count: elapsed.value }
                                )}
                                value={String(elapsed.value)}
                            />
                        ) : (
                            <HeroValue
                                unit=""
                                value={intl.formatMessage({
                                    id: 'detailsPanel.strip.freshness.none',
                                })}
                            />
                        )}
                    </StripCell>

                    <StripCell labelId="detailsPanel.strip.dataMoved">
                        <HeroValue
                            unit={formatBytes(totalBytes).split(' ')[1] ?? ''}
                            value={formatBytes(totalBytes).split(' ')[0]}
                        />
                    </StripCell>

                    {isCapture ? (
                        <AutoDiscoverCell entityName={entityName} />
                    ) : null}

                    <TaskStatusCell
                        entityName={entityName}
                        taskTypes={[entityType]}
                    />
                </Box>

                <StripFooter latestLiveSpec={latestLiveSpec} />
            </CardWrapper>
        </EntityContextProvider>
    );
}
