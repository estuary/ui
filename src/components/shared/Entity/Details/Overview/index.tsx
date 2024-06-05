import { Grid } from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import NotificationSettings from 'components/shared/Entity/Details/Overview/NotificationSettings';
import { TaskEndpoints } from 'components/shared/TaskEndpoints';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useLiveSpecs_details } from 'hooks/useLiveSpecs';
import { useMemo } from 'react';
import { hasLength } from 'utils/misc-utils';
import ShardInformation from '../../Shard/Information';
import Usage from '../Usage';
import useDetailsEntityTaskTypes from '../useDetailsEntityTaskTypes';
import DetailsSection from './DetailsSection';
import EntityConnectionsGraph from './EntityConnectionGraph';

// TODO (details page)
// Temporary - allow to pass in the name
interface Props {
    name?: string;
}

function Overview({ name }: Props) {
    const entityType = useEntityType();
    const isCollection = entityType === 'collection';
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const entityName = name ?? catalogName;
    const { liveSpecs, isValidating: validatingLiveSpecs } =
        useLiveSpecs_details(entityType, entityName);

    const latestLiveSpec = useMemo(
        () =>
            !validatingLiveSpecs && hasLength(liveSpecs) ? liveSpecs[0] : null,
        [liveSpecs, validatingLiveSpecs]
    );

    const taskTypes = useDetailsEntityTaskTypes();

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={8} lg={9}>
                <Usage catalogName={entityName} />
            </Grid>

            <Grid item xs={12} md={4} lg={3}>
                <DetailsSection
                    entityName={entityName}
                    latestLiveSpec={latestLiveSpec}
                    loading={validatingLiveSpecs}
                />
            </Grid>

            {latestLiveSpec && entityName ? (
                <Grid item xs={12}>
                    <EntityConnectionsGraph
                        currentNode={{
                            id: latestLiveSpec.id,
                            catalog_name: entityName,
                            spec_type: entityType,
                        }}
                    />
                </Grid>
            ) : null}

            {!isCollection && entityName ? (
                <Grid item xs={12}>
                    <NotificationSettings taskName={entityName} />
                </Grid>
            ) : null}

            {/* The grid item below exists when no children are present which creates 16 pixels of vertical padding. */}
            {!isCollection ? (
                <Grid item xs={12}>
                    <TaskEndpoints taskName={catalogName} />
                </Grid>
            ) : null}

            {hasLength(taskTypes) ? (
                <Grid item xs={12}>
                    <ShardInformation
                        taskTypes={taskTypes}
                        taskName={entityName}
                    />
                </Grid>
            ) : null}

            {isCollection && entityName ? (
                <Grid item xs={12}>
                    <DataPreview collectionName={entityName} />
                </Grid>
            ) : null}
        </Grid>
    );
}

export default Overview;
