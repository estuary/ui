import { AddBox, Cable, OpenInNew } from '@mui/icons-material';
import {
    Box,
    Button,
    Grid,
    Paper,
    Skeleton,
    Stack,
    SxProps,
    Theme,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ConnectorToolbar from 'components/ConnectorToolbar';
import useEntityCreateNavigate from 'components/shared/Entity/useEntityCreateNavigate';
import {
    darkGlassBkgColor,
    darkGlassBkgColorIntensified,
    slate,
} from 'context/Theme';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { CONNECTOR_NAME, defaultTableFilter, TABLES } from 'services/supabase';
import {
    BaseComponentProps,
    ENTITY_WITH_CREATE,
    SortDirection,
    TableIntlConfig,
    TableState,
    TableStatuses,
} from 'types';
import { hasLength } from 'utils/misc-utils';
import { getEmptyTableHeader, getEmptyTableMessage } from 'utils/table-utils';

interface ConnectorTilesProps {
    cardWidth: number;
    cardsPerRow: number;
    gridSpacing: number;
    protocolPreset?: ENTITY_WITH_CREATE;
    replaceOnNavigate?: boolean;
}

type TileProps = BaseComponentProps;

const intlConfig: TableIntlConfig = {
    header: 'connectors.main.message1',
    message: 'connectors.main.message2',
};

const imageBackgroundSx: SxProps<Theme> = {
    width: '100%',
    height: 125,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderRadius: 5,
    background: (theme) =>
        theme.palette.mode === 'dark'
            ? 'rgba(172, 199, 220, 0.30)' // Brighter than desired to improve MySQL visibility.
            : slate[25],
};

function Tile({ children }: TileProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                'height': '100%',
                'borderRadius': 5,
                'background': (theme) =>
                    theme.palette.mode === 'dark'
                        ? darkGlassBkgColor
                        : slate[50],
                'padding': 1,
                '&:hover': {
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? darkGlassBkgColorIntensified
                            : 'rgba(172, 199, 220, 0.45)',
                },
            }}
        >
            <Stack
                style={{
                    height: '100%',
                    justifyContent: 'space-between',
                }}
            >
                {children}
            </Stack>
        </Paper>
    );
}

function ConnectorTiles({
    cardWidth,
    cardsPerRow,
    gridSpacing,
    protocolPreset,
    replaceOnNavigate,
}: ConnectorTilesProps) {
    const navigateToCreate = useEntityCreateNavigate();
    const isFiltering = useRef(false);
    const intl = useIntl();

    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const [protocol, setProtocol] = useState<string | null>(
        protocolPreset ?? null
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [columnToSort, setColumnToSort] =
        useState<keyof ConnectorWithTagDetailQuery>(CONNECTOR_NAME);

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const primaryCtaClick = (row: ConnectorWithTagDetailQuery) => {
        navigateToCreate(
            row.connector_tags[0].protocol,
            row.connector_tags[0].id,
            replaceOnNavigate
        );
    };

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

    const { data: useSelectResponse, isValidating } = useSelect(liveSpecQuery);
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
    }, [selectData, isValidating]);

    const gridContainerWidth = belowMd
        ? '100%'
        : cardWidth * cardsPerRow + 8 * gridSpacing * (cardsPerRow + 1);

    const skeletonTileCount = useMemo(
        () => 12 / (belowMd ? 6 : 12 / cardsPerRow),
        [belowMd, cardsPerRow]
    );

    return (
        <Grid
            container
            spacing={gridSpacing}
            paddingRight={2}
            width={gridContainerWidth}
            margin="auto"
        >
            <Grid item xs={12}>
                <ConnectorToolbar
                    belowMd={belowMd}
                    gridSpacing={gridSpacing}
                    setColumnToSort={setColumnToSort}
                    hideProtocol={!!protocolPreset}
                    setProtocol={setProtocol}
                    setSortDirection={setSortDirection}
                    setSearchQuery={setSearchQuery}
                />
            </Grid>

            {hasLength(selectData) ? (
                selectData
                    .map((row, index) => (
                        <Grid
                            key={`connector-tile-${index}`}
                            item
                            xs={6}
                            md={12 / cardsPerRow}
                        >
                            <Tile>
                                <Box sx={imageBackgroundSx}>
                                    {row.image ? (
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
                                    ) : (
                                        <Cable sx={{ fontSize: '4rem' }} />
                                    )}
                                </Box>

                                <Typography align="center" marginBottom={1}>
                                    {row.title}
                                </Typography>

                                <Button
                                    href={
                                        row.connector_tags[0].documentation_url
                                    }
                                    target="_blank"
                                    rel="noopener"
                                    endIcon={<OpenInNew />}
                                    sx={{
                                        'backgroundColor': slate[25],
                                        '&:hover': {
                                            backgroundColor: slate[25],
                                        },
                                    }}
                                >
                                    <FormattedMessage id="terms.documentation" />
                                </Button>

                                <Typography
                                    component="div"
                                    variant="caption"
                                    align="center"
                                    marginBottom={5}
                                >
                                    <span
                                        style={{
                                            marginRight: '.5rem',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        <FormattedMessage id="entityTable.data.lastUpdatedWithColon" />
                                    </span>

                                    <FormattedDate
                                        day="numeric"
                                        month="long"
                                        year="numeric"
                                        value={row.updated_at}
                                    />
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                    }}
                                >
                                    <Button
                                        onClick={() => primaryCtaClick(row)}
                                    >
                                        {row.connector_tags[0].protocol ===
                                        'capture' ? (
                                            <FormattedMessage id="connectorTable.actionsCta.capture" />
                                        ) : (
                                            <FormattedMessage id="connectorTable.actionsCta.materialization" />
                                        )}
                                    </Button>
                                </Stack>
                            </Tile>
                        </Grid>
                    ))
                    .concat(
                        <Grid
                            key="connector-request-tile"
                            item
                            xs={6}
                            md={12 / cardsPerRow}
                        >
                            <Tile>
                                <Box>
                                    <Box sx={imageBackgroundSx}>
                                        <AddBox sx={{ fontSize: '4rem' }} />
                                    </Box>

                                    <Typography align="center" marginBottom={1}>
                                        <FormattedMessage id="connectorTable.data.connectorRequest" />
                                    </Typography>

                                    <Typography
                                        component="p"
                                        variant="caption"
                                        marginBottom={2}
                                        sx={{ px: 1 }}
                                    >
                                        <FormattedMessage id="connectors.main.message2.alt" />
                                    </Typography>
                                </Box>

                                <Button
                                    href={intl.formatMessage({
                                        id: 'connectors.main.message2.docPath',
                                    })}
                                    target="_blank"
                                    rel="noopener"
                                    endIcon={<OpenInNew />}
                                >
                                    <FormattedMessage id="connectorTable.actionsCta.connectorRequest" />
                                </Button>
                            </Tile>
                        </Grid>
                    )
            ) : isValidating || tableState.status === TableStatuses.LOADING ? (
                Array(skeletonTileCount)
                    .fill(
                        <Tile>
                            <Box>
                                <Skeleton
                                    variant="rectangular"
                                    height={125}
                                    sx={{ mb: 2, borderRadius: 3 }}
                                />

                                <Skeleton />

                                <Skeleton />

                                <Skeleton sx={{ mb: 5 }} />
                            </Box>

                            <Skeleton
                                variant="rectangular"
                                height={36}
                                sx={{ borderRadius: 3 }}
                            />
                        </Tile>
                    )
                    .map((skeleton, index) => (
                        <Grid
                            key={`connector-skeleton-${index}`}
                            item
                            xs={6}
                            md={12 / cardsPerRow}
                        >
                            {skeleton}
                        </Grid>
                    ))
            ) : (
                <Grid item sx={{ width: '100%' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            height: 300,
                            borderRadius: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            background:
                                theme.palette.mode === 'dark'
                                    ? darkGlassBkgColor
                                    : slate[50],
                            padding: 1,
                        }}
                    >
                        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
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
    );
}

export default ConnectorTiles;
