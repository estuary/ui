import { DescriptionRounded } from '@mui/icons-material';
import {
    Box,
    Button,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import { PostgrestError } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
import ConnectorToolbar from 'components/ConnectorToolbar';
import MessageWithLink from 'components/content/MessageWithLink';
import { SortDirection } from 'components/tables/EntityTable';
import { slate } from 'context/Theme';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CONNECTOR_NAME, defaultTableFilter, TABLES } from 'services/supabase';
import { getPathWithParam, hasLength } from 'utils/misc-utils';

interface Props {
    cardWidth: number;
    cardsPerRow: number;
    gridSpacing: number;
}

enum TableStatuses {
    LOADING = 'LOADING',
    DATA_FETCHED = 'DATA_FETCHED',
    NO_EXISTING_DATA = 'NO_EXISTING_DATA',
    TECHNICAL_DIFFICULTIES = 'TECHNICAL_DIFFICULTIES',
    UNMATCHED_FILTER = 'UNMATCHED_FILTER',
}

type TableStatus =
    | TableStatuses.LOADING
    | TableStatuses.DATA_FETCHED
    | TableStatuses.NO_EXISTING_DATA
    | TableStatuses.TECHNICAL_DIFFICULTIES
    | TableStatuses.UNMATCHED_FILTER;

interface TableState {
    status: TableStatus;
    error?: PostgrestError;
}

function ConnectorTile({ cardWidth, cardsPerRow, gridSpacing }: Props) {
    const navigate = useNavigate();
    const isFiltering = useRef(false);

    const [protocol, setProtocol] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [columnToSort, setColumnToSort] =
        useState<keyof ConnectorWithTagDetailQuery>(CONNECTOR_NAME);

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const liveSpecQuery = useQuery<ConnectorWithTagDetailQuery>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTOR_WITH_TAG_QUERY,
            filter: (query) => {
                return defaultTableFilter<ConnectorWithTagDetailQuery>(
                    query,
                    [columnToSort],
                    searchQuery,
                    columnToSort,
                    sortDirection,
                    undefined,
                    { column: 'connector_tags.protocol', value: protocol }
                );
            },
        },
        [searchQuery, columnToSort, sortDirection, protocol]
    );

    const {
        data: useSelectResponse,
        isValidating,
        // mutate: mutateSelectData,
    } = useSelect(liveSpecQuery);
    const selectData = useMemo(
        () => (useSelectResponse ? useSelectResponse.data : []),
        [useSelectResponse]
    );

    useEffect(() => {
        if (selectData.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
        } else if (isFiltering.current) {
            setTableState({ status: TableStatuses.UNMATCHED_FILTER });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [selectData]);

    const getEmptyTableHeader = (tableStatus: TableStatuses): string => {
        switch (tableStatus) {
            case TableStatuses.TECHNICAL_DIFFICULTIES:
                return 'entityTable.technicalDifficulties.header';
            case TableStatuses.UNMATCHED_FILTER:
                return 'entityTable.unmatchedFilter.header';
            default:
                return 'connectors.main.message1';
        }
    };

    const getEmptyTableMessage = (tableStatus: TableStatuses): JSX.Element => {
        switch (tableStatus) {
            case TableStatuses.TECHNICAL_DIFFICULTIES:
                return (
                    <FormattedMessage id="entityTable.technicalDifficulties.message" />
                );
            case TableStatuses.UNMATCHED_FILTER:
                return (
                    <FormattedMessage id="entityTable.unmatchedFilter.message" />
                );
            default: {
                return <MessageWithLink messageID="connectors.main.message2" />;
            }
        }
    };

    return (
        <Grid
            container
            spacing={2}
            paddingRight={2}
            width={
                cardWidth * cardsPerRow + 8 * gridSpacing * (cardsPerRow + 1)
            }
            margin="auto"
        >
            <Grid item sx={{ width: '100%' }}>
                <ConnectorToolbar
                    cardWidth={cardWidth}
                    setColumnToSort={setColumnToSort}
                    setProtocol={setProtocol}
                    setSortDirection={setSortDirection}
                    setSearchQuery={setSearchQuery}
                />
            </Grid>

            {hasLength(selectData) ? (
                selectData.map((row, index) => (
                    <Grid key={index} item>
                        <Paper
                            elevation={0}
                            sx={{
                                width: cardWidth,
                                height: '100%',
                                borderRadius: 5,
                                background: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'linear-gradient(160deg, rgba(172, 199, 220, 0.18) 2%, rgba(172, 199, 220, 0.12) 40%)'
                                        : slate[50],
                                padding: 1,
                            }}
                        >
                            <Stack
                                style={{
                                    height: '100%',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 125,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 2,
                                        borderRadius: 5,
                                        background: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'linear-gradient(160deg, rgba(172, 199, 220, 0.18) 2%, rgba(172, 199, 220, 0.12) 40%)'
                                                : slate[25],
                                    }}
                                >
                                    <img
                                        src={row.image}
                                        loading="lazy"
                                        alt=""
                                        style={{
                                            width: 'auto',
                                            maxHeight: 75,
                                            padding: '0 1rem',
                                        }}
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        width: '100%',
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-around',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography marginRight={1}>
                                            {row.title}
                                        </Typography>

                                        <IconButton
                                            href={
                                                row.connector_tags[0]
                                                    .documentation_url
                                            }
                                            target="_blank"
                                            rel="noopener"
                                        >
                                            <DescriptionRounded />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Typography
                                    variant="caption"
                                    align="center"
                                    marginBottom={2}
                                >
                                    {row.image_name}
                                </Typography>

                                <Typography
                                    component="div"
                                    variant="caption"
                                    align="center"
                                    marginBottom={5}
                                >
                                    <span style={{ fontWeight: 'bold' }}>
                                        Last Updated:{' '}
                                    </span>

                                    <FormattedDate
                                        day="numeric"
                                        month="long"
                                        year="numeric"
                                        value={row.updated_at}
                                    />
                                </Typography>

                                <Button
                                    size="small"
                                    onClick={() => {
                                        if (
                                            row.connector_tags[0].protocol ===
                                            'capture'
                                        ) {
                                            navigate(
                                                getPathWithParam(
                                                    authenticatedRoutes.captures
                                                        .create.fullPath,
                                                    authenticatedRoutes.captures
                                                        .create.params
                                                        .connectorID,
                                                    row.connector_tags[0].id
                                                )
                                            );
                                        } else if (
                                            row.connector_tags[0].protocol ===
                                            'materialization'
                                        ) {
                                            navigate(
                                                getPathWithParam(
                                                    authenticatedRoutes
                                                        .materializations.create
                                                        .fullPath,
                                                    authenticatedRoutes
                                                        .materializations.create
                                                        .params.connectorId,
                                                    row.connector_tags[0].id
                                                )
                                            );
                                        }
                                    }}
                                >
                                    {row.connector_tags[0].protocol ===
                                    'capture' ? (
                                        <FormattedMessage id="connectorTable.actionsCta.capture" />
                                    ) : (
                                        <FormattedMessage id="connectorTable.actionsCta.materialization" />
                                    )}
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>
                ))
            ) : (
                <Grid item sx={{ width: '100%' }}>
                    {isValidating ||
                    tableState.status === TableStatuses.LOADING ? (
                        <Box>
                            <LinearProgress />
                        </Box>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                height: '100%',
                                borderRadius: 5,
                                background: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'linear-gradient(160deg, rgba(172, 199, 220, 0.18) 2%, rgba(172, 199, 220, 0.12) 40%)'
                                        : slate[50],
                                padding: 1,
                            }}
                        >
                            <Typography
                                variant="h6"
                                align="center"
                                sx={{ mb: 2 }}
                            >
                                <FormattedMessage
                                    id={getEmptyTableHeader(tableState.status)}
                                />
                            </Typography>

                            <Typography component="div" align="center">
                                {getEmptyTableMessage(tableState.status)}
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            )}
        </Grid>
    );
}

export default ConnectorTile;
