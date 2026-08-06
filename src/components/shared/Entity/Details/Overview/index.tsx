import type { DetailsOverviewProps } from 'src/components/shared/Entity/Details/Overview/types';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { useMemo } from 'react';

import { Grid } from '@mui/material';

import { DataPreview } from 'src/components/collection/DataPreview';
import { useEditorStore_specs } from 'src/components/editor/Store/hooks';
import { TaskEndpoints } from 'src/components/shared/Endpoints/TaskEndpoints';
import AlertsPanel from 'src/components/shared/Entity/Details/Overview/AlertsPanel';
import Bindings from 'src/components/shared/Entity/Details/Overview/Bindings';
import DetailsSection from 'src/components/shared/Entity/Details/Overview/DetailsSection';
import StatusStrip from 'src/components/shared/Entity/Details/Overview/StatusStrip';
import Usage from 'src/components/shared/Entity/Details/Usage';
import ShardInformation from 'src/components/shared/Entity/Shard/Information';
import { useEntityType } from 'src/context/EntityContext';
import useActiveAlerts from 'src/hooks/details/useActiveAlerts';
import useDetailsEntityTaskTypes from 'src/hooks/details/useDetailsEntityTaskTypes';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useShardEndpoints } from 'src/hooks/shards/useShardEndpoints';
import JournalHydrator from 'src/stores/JournalData/Hydrator';
import { hasLength } from 'src/utils/misc-utils';

function Overview({ name }: DetailsOverviewProps) {
    const entityType = useEntityType();
    const isCollection = entityType === 'collection';
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const entityName = name ?? catalogName;

    const editorSpecs = useEditorStore_specs<LiveSpecsQuery_details>({
        localScope: true,
    });

    const latestLiveSpec = useMemo(
        () => (editorSpecs && hasLength(editorSpecs) ? editorSpecs[0] : null),
        [editorSpecs]
    );

    const taskTypes = useDetailsEntityTaskTypes();

    // Same arguments TaskEndpoints itself uses — for a task `taskTypes` is
    // `[entityType]` — so this reads the same memoised store slice rather than
    // second-guessing what the component will decide to render.
    const { endpoints: taskEndpoints } = useShardEndpoints(
        catalogName,
        taskTypes,
        latestLiveSpec?.reactor_address
    );

    const { alerts: activeAlerts } = useActiveAlerts(
        isCollection ? '' : entityName
    );

    // Note there is deliberately no `alignItems` override on the Grid container
    // below. The task layout is all full-width rows, so it would gain nothing,
    // and on the collection page — which keeps its rail — switching off the
    // Grid's `stretch` default would stop the two cards matching heights,
    // changing a page this work is not meant to touch.
    return (
        <Grid container spacing={2}>
            {/* Tasks put their status facts in a full-width strip above the
                chart, so the chart and the bindings table each get the whole
                width. A collection has no bindings, so it keeps the rail. */}
            {isCollection ? (
                <>
                    <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                        <Usage catalogName={entityName} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                        <DetailsSection
                            entityName={entityName}
                            latestLiveSpec={latestLiveSpec}
                            loading={!Boolean(latestLiveSpec)}
                        />
                    </Grid>
                </>
            ) : (
                <>
                    <Grid size={{ xs: 12 }}>
                        <StatusStrip
                            entityName={entityName}
                            latestLiveSpec={latestLiveSpec}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
                        <Usage catalogName={entityName} />
                    </Grid>

                    {/* Beside the chart from `md` up, which is 900 in this
                        theme — not `lg`, which is 1440 here and would have left
                        the panel stacked on any normal laptop.

                        Above the chart once the two genuinely do not fit,
                        rather than below it: if something is firing, it is the
                        reason someone opened the page. */}
                    <Grid
                        size={{ xs: 12, md: 4 }}
                        sx={{ order: { xs: -1, md: 0 } }}
                    >
                        <AlertsPanel
                            alerts={activeAlerts}
                            entityName={entityName}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Bindings
                            entityName={entityName}
                            latestLiveSpec={latestLiveSpec}
                        />
                    </Grid>
                </>
            )}

            {/* Gated on the endpoints rather than just on the entity type:
                TaskEndpoints renders nothing when a task exposes none, and most
                do not. The grid item around it is not empty-aware, so it still
                took a row and left a 32px gap above Shard Information where
                every other gap on the page is 16. */}
            {!isCollection && hasLength(taskEndpoints) ? (
                <Grid size={{ xs: 12 }}>
                    <TaskEndpoints
                        reactorAddress={latestLiveSpec?.reactor_address}
                        taskName={catalogName}
                    />
                </Grid>
            ) : null}

            {hasLength(taskTypes) ? (
                <Grid size={{ xs: 12 }}>
                    <ShardInformation
                        taskTypes={taskTypes}
                        taskName={entityName}
                    />
                </Grid>
            ) : null}

            {isCollection && entityName ? (
                <Grid size={{ xs: 12 }}>
                    <JournalHydrator
                        catalogName={entityName}
                        isCollection={isCollection}
                    >
                        <DataPreview collectionName={entityName} />
                    </JournalHydrator>
                </Grid>
            ) : null}
        </Grid>
    );
}

export default Overview;
