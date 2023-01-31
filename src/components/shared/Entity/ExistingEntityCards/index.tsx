import { Box, Grid, useMediaQuery, useTheme } from '@mui/material';
import {
    CaptureQueryWithSpec,
    getLiveSpecs_existingTasks,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';
import ExistingEntityCard from 'components/shared/Entity/ExistingEntityCards/Cards/Existing';
import NewEntityCard from 'components/shared/Entity/ExistingEntityCards/Cards/New';
import {
    useExistingEntity_createNewTask,
    useExistingEntity_hydrated,
    useExistingEntity_queryData,
    useExistingEntity_resetState,
    useExistingEntity_setQueryData,
} from 'components/shared/Entity/ExistingEntityCards/Store/hooks';
import ExistingEntityCardToolbar from 'components/shared/Entity/ExistingEntityCards/Toolbar';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { ToPostgrestFilterBuilder } from 'hooks/supabase-swr';
import { useDistributedSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { useEffect, useMemo, useState } from 'react';
import { useUnmount } from 'react-use';

const columnToSort = 'catalog_name';

function ExistingEntityCards() {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);
    const navigateToCreate = useEntityCreateNavigate();

    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const entityType = useEntityType();

    // Existing Entity Store
    const hydrated = useExistingEntity_hydrated();
    const createNewTask = useExistingEntity_createNewTask();

    const queryData = useExistingEntity_queryData();
    const setQueryData = useExistingEntity_setQueryData();

    const resetExistingEntityState = useExistingEntity_resetState();

    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const liveSpecQuery: ToPostgrestFilterBuilder<
        CaptureQueryWithSpec | MaterializationQueryWithSpec
    > = useMemo(() => {
        return getLiveSpecs_existingTasks(
            entityType,
            connectorId,
            searchQuery,
            [
                {
                    col: columnToSort,
                    direction: sortDirection,
                },
            ]
        );
    }, [connectorId, entityType, searchQuery, sortDirection]);

    const { data: useSelectResponse } = useDistributedSelectNew<
        CaptureQueryWithSpec | MaterializationQueryWithSpec
    >(liveSpecQuery);

    const selectData = useMemo(
        () => (useSelectResponse ? useSelectResponse.data : []),
        [useSelectResponse]
    );

    useEffect(() => {
        if (
            hydrated &&
            connectorId &&
            createNewTask &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            navigateToCreate(entityType, connectorId, true, true);
        }
    }, [navigateToCreate, connectorId, createNewTask, entityType, hydrated]);

    useEffect(() => {
        setQueryData(selectData);
    }, [setQueryData, selectData]);

    useUnmount(() => {
        resetExistingEntityState();
    });

    // TODO (optimization): Add an existing entity card loading state.
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={{ xs: 2 }} sx={{ maxWidth: 1500 }}>
                <Grid item xs={12}>
                    <ExistingEntityCardToolbar
                        belowMd={belowMd}
                        gridSpacing={2}
                        setSearchQuery={setSearchQuery}
                        setSortDirection={setSortDirection}
                    />
                </Grid>

                {queryData && queryData.length > 0
                    ? queryData.map((data, index) => (
                          <Grid
                              key={`existing-entity-card-${index}`}
                              item
                              xs={12}
                          >
                              <ExistingEntityCard queryData={data} />
                          </Grid>
                      ))
                    : null}

                <Grid item xs={12}>
                    <NewEntityCard />
                </Grid>
            </Grid>
        </Box>
    );
}

export default ExistingEntityCards;
