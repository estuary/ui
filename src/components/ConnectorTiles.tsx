import { AddBox, OpenInNew } from '@mui/icons-material';
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
import ConnectorCard from 'components/connectors/Card';
import ConnectorToolbar from 'components/ConnectorToolbar';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
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
import { FormattedMessage, useIntl } from 'react-intl';
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
    protocolPreset?: ENTITY_WITH_CREATE;
    replaceOnNavigate?: boolean;
}

type TileProps = BaseComponentProps;

const skeletonTileCount = 6;

const intlConfig: TableIntlConfig = {
    header: 'connectors.main.message1',
    message: 'connectors.main.message2',
};

export const imageBackgroundSx: SxProps<Theme> = {
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

    const primaryCtaClick = (row: ConnectorWithTagDetailQuery) => {
        navigateToCreate(
            row.connector_tags[0].protocol,
            row.connector_tags[0].id,
            replaceOnNavigate
        );
    };

    useEffect(() => {
        if (selectData.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
        } else if (isFiltering.current) {
            setTableState({ status: TableStatuses.UNMATCHED_FILTER });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [selectData, isValidating]);

    return (
        <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 2, sm: 4, md: 12, lg: 12, xl: 12 }}
            paddingRight={2}
            margin="auto"
        >
            <Grid item xs={12}>
                <ConnectorToolbar
                    belowMd={belowMd}
                    gridSpacing={2}
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
                        <ConnectorCard
                            key={`connector-tile-${index}`}
                            imageSrc={row.image}
                            lastUpdate={row.updated_at}
                            title={row.title}
                            docsUrl={row.connector_tags[0].documentation_url}
                            entity={row.connector_tags[0].protocol}
                            ctaCallback={() => primaryCtaClick(row)}
                            description={row.detail}
                        />
                    ))
                    .concat(
                        <Grid
                            key="connector-request-tile"
                            item
                            xs={2}
                            md={4}
                            lg={3}
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
                            xs={2}
                            md={4}
                            lg={3}
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
