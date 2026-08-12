import type { DetailsSectionProps } from 'src/components/shared/Entity/Details/Overview/DetailsSection/types';

import { useMemo } from 'react';

import { CircularProgress, Skeleton } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import DataPlane from 'src/components/shared/Entity/DataPlane';
import { BacklogSection } from 'src/components/shared/Entity/Details/Overview/DetailsSection/BacklogSection';
import ConnectorSection from 'src/components/shared/Entity/Details/Overview/DetailsSection/ConnectorSection';
import { TIME_SETTINGS } from 'src/components/shared/Entity/Details/Overview/DetailsSection/shared';
import StatusSection from 'src/components/shared/Entity/Details/Overview/DetailsSection/StatusSection';
import { TimeLagSection } from 'src/components/shared/Entity/Details/Overview/DetailsSection/TimeLagSection';
import KeyValueList from 'src/components/shared/KeyValueList';
import { useEntityType } from 'src/context/EntityContext';
import { useMaterializationBacklog } from 'src/hooks/details/useMaterializationBacklog';
import useRelatedEntities from 'src/hooks/details/useRelatedEntities';
import { useShardDetail_runtimeV2 } from 'src/stores/ShardDetail/hooks';
import {
    formatDataPlaneName,
    getDataPlaneScope,
    parseDataPlaneName,
} from 'src/utils/dataPlane-utils';
import { hasLength } from 'src/utils/misc-utils';

function DetailsSection({ entityName, latestLiveSpec }: DetailsSectionProps) {
    const intl = useIntl();

    const entityType = useEntityType();

    const relatedEntities = useRelatedEntities();

    // Only the V2 runtime reports a task's progress through its bindings, so
    // there is nothing to show for a task running on anything else.
    const runtimeV2 = useShardDetail_runtimeV2(entityName);
    const showBacklog = entityType === 'materialization' && runtimeV2;

    // Passing an empty name leaves the queries unissued, so this costs nothing
    // for a task with no backlog rows to show. Where it does apply, the request
    // is shared with the rows themselves rather than repeated.
    const { loading: backlogLoading, timeLagLoading } =
        useMaterializationBacklog(
            // TODO: this is a bit of a hack. An empty string below prevents the hook from firing - necessary because
            // DetailsSection is used for more than just materializations. Would be nice to split this out into more composable components.
            showBacklog ? entityName : ''
        );

    const data = useMemo(() => {
        const response = [];

        // If there is nothing to show then display the loading status. The
        // backlog rows are covered here as well, so the card fills in once,
        // rather than settling and then filling those two in behind it.
        if (!latestLiveSpec || backlogLoading || timeLagLoading) {
            response.push(
                {
                    title: <Skeleton width="33%" />,
                    val: <Skeleton width="75%" />,
                },
                {
                    title: <Skeleton width="33%" sx={{ opacity: '66%' }} />,
                    val: <Skeleton width="75%" sx={{ opacity: '66%' }} />,
                },
                {
                    title: <Skeleton width="33%" sx={{ opacity: '33%' }} />,
                    val: <Skeleton width="75%" sx={{ opacity: '33%' }} />,
                }
            );
            return response;
        }

        if (latestLiveSpec.connectorName) {
            response.push({
                title: intl.formatMessage({
                    id: 'connector.label',
                }),
                val: <ConnectorSection latestLiveSpec={latestLiveSpec} />,
            });
        }

        if (entityType !== 'collection') {
            response.push({
                title: intl.formatMessage({
                    id: 'data.connectorStatus',
                }),
                val: <StatusSection entityName={entityName} />,
            });
        }

        if (showBacklog) {
            response.push({
                title: 'Data Backlog',
                val: <BacklogSection entityName={entityName} />,
            });

            // Both rows are shown for any V2 materialization. When the lag cannot
            // be computed — a source collection whose producer is not on V2 records
            // no `lastPublishedAt` to compare against — the row renders an em-dash
            // rather than dropping out.
            response.push({
                title: 'Time Behind',
                val: <TimeLagSection entityName={entityName} />,
            });
        }

        if (hasLength(latestLiveSpec.data_plane_name)) {
            const dataPlaneScope = getDataPlaneScope(
                latestLiveSpec.data_plane_name
            );

            const dataPlaneName = parseDataPlaneName(
                latestLiveSpec.data_plane_name,
                dataPlaneScope
            );

            response.push({
                title: intl.formatMessage({ id: 'data.dataPlane' }),
                val: (
                    <DataPlane
                        dataPlaneName={dataPlaneName}
                        formattedSuffix={formatDataPlaneName(dataPlaneName)}
                        logoSize={20}
                        scope={dataPlaneScope}
                    />
                ),
            });
        }

        // Add last updated - without user as Estuary folks
        //  sometimes update stuff and that might look odd
        response.push({
            title: intl.formatMessage({
                id: 'entityTable.data.lastUpdated',
            }),
            val: `${intl.formatDate(latestLiveSpec.updated_at, TIME_SETTINGS)}`,
        });

        // At when it was created
        response.push({
            title: intl.formatMessage({
                id: 'data.created_at',
            }),
            val: intl.formatDate(latestLiveSpec.created_at, TIME_SETTINGS),
        });

        return response;
    }, [
        backlogLoading,
        entityName,
        entityType,
        intl,
        latestLiveSpec,
        showBacklog,
        timeLagLoading,
    ]);

    return (
        <CardWrapper
            message={
                <span>
                    {intl.formatMessage({ id: 'detailsPanel.details.title' })}
                </span>
            }
        >
            {!hasLength(data) ? (
                <CircularProgress />
            ) : (
                <KeyValueList data={[...data, ...relatedEntities]} />
            )}
        </CardWrapper>
    );
}

export default DetailsSection;
