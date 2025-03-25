import { Grid } from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { useEditorStore_specs } from 'components/editor/Store/hooks';
import { TaskEndpoints } from 'components/shared/Endpoints/TaskEndpoints';
import NotificationSettings from 'components/shared/Entity/Details/Overview/NotificationSettings';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import type { LiveSpecsQuery_details } from 'hooks/useLiveSpecs';
import { useMemo } from 'react';
import JournalHydrator from 'stores/JournalData/Hydrator';
import { hasLength } from 'utils/misc-utils';
import ShardInformation from '../../Shard/Information';
import Usage from '../Usage';
import useDetailsEntityTaskTypes from '../useDetailsEntityTaskTypes';
import DetailsSection from './DetailsSection';
import type { DetailsOverviewProps } from './types';

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

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={8} lg={9}>
                <Usage catalogName={entityName} />
            </Grid>

            <Grid item xs={12} md={4} lg={3}>
                <DetailsSection
                    entityName={entityName}
                    latestLiveSpec={latestLiveSpec}
                    loading={!Boolean(latestLiveSpec)}
                />
            </Grid>

            {!isCollection && entityName ? (
                <Grid item xs={12}>
                    <NotificationSettings taskName={entityName} />
                </Grid>
            ) : null}

            {/* The grid item below exists when no children are present which creates 16 pixels of vertical padding. */}
            {!isCollection ? (
                <Grid item xs={12}>
                    <TaskEndpoints
                        reactorAddress={latestLiveSpec?.reactor_address}
                        taskName={catalogName}
                    />
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
