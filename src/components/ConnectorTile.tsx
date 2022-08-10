import { DescriptionRounded } from '@mui/icons-material';
import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Box,
    Button,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import { PostgrestError } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
import MessageWithLink from 'components/content/MessageWithLink';
import { slate } from 'context/Theme';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import { debounce } from 'lodash';
import {
    ChangeEvent,
    SyntheticEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CONNECTOR_NAME, defaultTableFilter, TABLES } from 'services/supabase';
import { ENTITY } from 'types';
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
    const intl = useIntl();
    const isFiltering = useRef(false);

    const paramFilterOptions: {
        field: keyof ConnectorWithTagDetailQuery;
        message: string;
    }[] = useMemo(
        () => [
            {
                field: CONNECTOR_NAME,
                message: intl.formatMessage({
                    id: 'connectorTable.data.title',
                }),
            },
            {
                field: 'image_name',
                message: intl.formatMessage({
                    id: 'connectorTable.data.image_name',
                }),
            },
        ],
        [intl]
    );

    const protocolFilterOptions: {
        protocol: ENTITY | null;
        message: string;
    }[] = useMemo(
        () => [
            {
                protocol: null,
                message: intl.formatMessage({
                    id: 'common.optionsAll',
                }),
            },
            {
                protocol: ENTITY.CAPTURE,
                message: intl.formatMessage({
                    id: 'terms.capture',
                }),
            },
            {
                protocol: ENTITY.MATERIALIZATION,
                message: intl.formatMessage({
                    id: 'terms.materialization',
                }),
            },
        ],
        [intl]
    );

    const [protocol, setProtocol] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
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

    const handlers = {
        filterTiles: debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;
                const hasQuery = Boolean(filterQuery && filterQuery.length > 0);

                isFiltering.current = hasQuery;

                setSearchQuery(hasQuery ? filterQuery : null);
            },
            750
        ),
        setFilterParam: debounce(
            (_event: SyntheticEvent, value: string | null) => {
                setSortDirection('asc');

                const selectedColumn = paramFilterOptions.find(
                    (option) => option.message === value
                )?.field;

                setColumnToSort(
                    selectedColumn ? selectedColumn : CONNECTOR_NAME
                );
            },
            750
        ),
        setProtocol: debounce(
            (_event: SyntheticEvent, value: string | null) => {
                const selectedProtocol = protocolFilterOptions.find(
                    (option) => option.message === value
                )?.protocol;

                setProtocol(selectedProtocol ? selectedProtocol : null);
            },
            750
        ),
    };

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

    const testProps = { borderRadius: 5 };

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
                <Toolbar disableGutters sx={{ justifyContent: 'flex-end' }}>
                    <Autocomplete
                        options={paramFilterOptions.map(
                            ({ message }) => message
                        )}
                        renderInput={({
                            InputProps,
                            ...params
                        }: AutocompleteRenderInputParams) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...InputProps,
                                    disableUnderline: true,
                                    sx: testProps,
                                }}
                                label="Filter Param"
                                variant="filled"
                            />
                        )}
                        defaultValue={intl.formatMessage({
                            id: 'connectorTable.data.title',
                        })}
                        disableClearable
                        onChange={handlers.setFilterParam}
                        sx={{ width: 150, mr: 2 }}
                    />

                    <Autocomplete
                        options={protocolFilterOptions.map(
                            ({ message }) => message
                        )}
                        renderInput={({
                            InputProps,
                            ...params
                        }: AutocompleteRenderInputParams) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...InputProps,
                                    disableUnderline: true,
                                    sx: testProps,
                                }}
                                label="Protocol"
                                variant="filled"
                            />
                        )}
                        defaultValue={intl.formatMessage({
                            id: 'common.optionsAll',
                        })}
                        disableClearable
                        onChange={handlers.setProtocol}
                        sx={{ width: 200, mr: 2 }}
                    />

                    <TextField
                        label={intl.formatMessage({
                            id: 'connectorTable.filterLabel',
                        })}
                        variant="filled"
                        InputProps={{
                            disableUnderline: true,
                            sx: testProps,
                        }}
                        onChange={handlers.filterTiles}
                        sx={{ width: cardWidth, borderRadius: 5 }}
                    />
                </Toolbar>
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
