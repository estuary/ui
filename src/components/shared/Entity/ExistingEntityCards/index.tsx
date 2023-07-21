import { useEffect, useMemo, useRef, useState } from 'react';

import {
    SortDirection,
    TableIntlConfig,
    TableState,
    TableStatuses,
} from 'types';
import { FormattedMessage } from 'react-intl';
import { useUnmount } from 'react-use';

import {
    Box,
    Divider,
    Grid,
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import {
    CaptureQueryWithSpec,
    getLiveSpecs_existingTasks,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';

import ExistingEntityCard from 'components/shared/Entity/ExistingEntityCards/Cards/Existing';
import NewEntityCard from 'components/shared/Entity/ExistingEntityCards/Cards/New';
import ExistingEntityCardSkeleton from 'components/shared/Entity/ExistingEntityCards/Skeleton';
import {
    useExistingEntity_queryData,
    useExistingEntity_resetState,
    useExistingEntity_setQueryData,
} from 'components/shared/Entity/ExistingEntityCards/Store/hooks';
import ExistingEntityCardToolbar from 'components/shared/Entity/ExistingEntityCards/Toolbar';

import { useEntityType } from 'context/EntityContext';
import { semiTransparentBackground } from 'context/Theme';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { ToPostgrestFilterBuilder } from 'hooks/supabase-swr';
import { useDistributedSelectNew } from 'hooks/supabase-swr/hooks/useSelect';

import { getEmptyTableHeader, getEmptyTableMessage } from 'utils/table-utils';

const intlConfig: TableIntlConfig = {
    header: 'existingEntityCheck.filter.unmatched.header',
    message: 'existingEntityCheck.filter.unmatched.message',
    disableDoclink: true,
};

const columnToSort = 'catalog_name';

function ExistingEntityCards() {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const isFiltering = useRef(false);

    const entityType = useEntityType();

    // Existing Entity Store
    const queryData = useExistingEntity_queryData();
    const setQueryData = useExistingEntity_setQueryData();

    const resetExistingEntityState = useExistingEntity_resetState();

    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

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

    const { data: useSelectResponse, isValidating } = useDistributedSelectNew<
        CaptureQueryWithSpec | MaterializationQueryWithSpec
    >(liveSpecQuery);

    const selectData = useMemo(
        () => (useSelectResponse ? useSelectResponse.data : []),
        [useSelectResponse]
    );

    useEffect(() => {
        setQueryData(selectData);
    }, [setQueryData, selectData]);

    useEffect(() => {
        if (queryData && queryData.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
        } else if (isFiltering.current) {
            setTableState({ status: TableStatuses.UNMATCHED_FILTER });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [queryData, isValidating]);

    useUnmount(() => {
        resetExistingEntityState();
    });

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={{ xs: 2 }}>
                <Grid item xs={12}>
                    <ExistingEntityCardToolbar
                        belowMd={belowMd}
                        gridSpacing={2}
                        setSearchQuery={setSearchQuery}
                        setSortDirection={setSortDirection}
                    />
                </Grid>

                <Grid item xs={12}>
                    <NewEntityCard />
                </Grid>

                <Grid item xs={12} sx={{ my: 2 }}>
                    <Divider flexItem />
                </Grid>

                {queryData && queryData.length > 0 ? (
                    queryData.map((data, index) => (
                        <Grid
                            key={`existing-entity-card-${index}`}
                            item
                            xs={12}
                        >
                            <ExistingEntityCard queryData={data} />
                        </Grid>
                    ))
                ) : isValidating ||
                  tableState.status === TableStatuses.LOADING ? (
                    <>
                        <Grid item xs={12}>
                            <ExistingEntityCardSkeleton />
                        </Grid>

                        <Grid item xs={12}>
                            <ExistingEntityCardSkeleton opacity="66%" />
                        </Grid>

                        <Grid item xs={12}>
                            <ExistingEntityCardSkeleton opacity="33%" />
                        </Grid>
                    </>
                ) : (
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                height: 230,
                                borderRadius: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                background:
                                    semiTransparentBackground[
                                        theme.palette.mode
                                    ],
                                padding: 1,
                            }}
                        >
                            <Typography
                                variant="h6"
                                align="center"
                                sx={{ mb: 1 }}
                            >
                                <FormattedMessage
                                    id={getEmptyTableHeader(
                                        tableState.status,
                                        intlConfig
                                    )}
                                />
                            </Typography>

                            <Typography component="div" align="center">
                                {getEmptyTableMessage(
                                    tableState.status,
                                    intlConfig
                                )}
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default ExistingEntityCards;
