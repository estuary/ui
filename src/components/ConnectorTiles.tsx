import {
    Box,
    Button,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import ConnectorCard from 'components/connectors/card';
import ConnectorToolbar from 'components/ConnectorToolbar';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import {
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import { AddSquare, OpenNewWindow } from 'iconoir-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    defaultTableFilter,
    TABLES,
} from 'services/supabase';
import {
    BaseComponentProps,
    EntityWithCreateWorkflow,
    SortDirection,
    TableIntlConfig,
    TableState,
    TableStatuses,
} from 'types';
import { hasLength } from 'utils/misc-utils';
import { getEmptyTableHeader, getEmptyTableMessage } from 'utils/table-utils';
import ConnectorCardCTA from './connectors/card/CTA';
import ConnectorCardDetails from './connectors/card/Details';
import ConnectorLogo from './connectors/card/Logo';
import ConnectorCardTitle from './connectors/card/Title';

interface ConnectorTilesProps {
    protocolPreset?: EntityWithCreateWorkflow;
    replaceOnNavigate?: boolean;
}

type TileProps = BaseComponentProps;

const skeletonTileCount = 6;

const intlConfig: TableIntlConfig = {
    header: 'connectors.main.message1',
    message: 'connectors.main.message2',
};

function Tile({ children }: TileProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                'height': '100%',
                'padding': 1,
                'background': (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                'boxShadow':
                    'rgb(50 50 93 / 7%) 0px 2px 5px -1px, rgb(0 0 0 / 10%) 0px 1px 3px -1px',
                'borderRadius': 3,
                '&:hover': {
                    background: (theme) =>
                        semiTransparentBackgroundIntensified[
                            theme.palette.mode
                        ],
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
                    [
                        {
                            col: CONNECTOR_RECOMMENDED,
                            direction: 'desc',
                        },
                        {
                            col: columnToSort,
                            direction: sortDirection,
                        },
                    ],
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
            columns={{ xs: 4, sm: 4, md: 12, lg: 12, xl: 12 }}
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
                            docsUrl={row.connector_tags[0].documentation_url}
                            logo={<ConnectorLogo imageSrc={row.image} />}
                            title={<ConnectorCardTitle title={row.title} />}
                            details={
                                <ConnectorCardDetails
                                    description={row.detail}
                                    lastUpdate={row.updated_at}
                                />
                            }
                            cta={
                                <ConnectorCardCTA
                                    ctaCallback={() => primaryCtaClick(row)}
                                    entity={row.connector_tags[0].protocol}
                                />
                            }
                            recommended={row.recommended}
                        />
                    ))
                    .concat(
                        <ConnectorCard
                            key="connector-request-tile"
                            logo={
                                <AddSquare
                                    style={{
                                        fontSize: '3rem',
                                        color: theme.palette.text.primary,
                                    }}
                                />
                            }
                            details={
                                <Typography component="p">
                                    <FormattedMessage id="connectors.main.message2.alt" />
                                </Typography>
                            }
                            cta={
                                <Button
                                    href={intl.formatMessage({
                                        id: 'connectors.main.message2.docPath',
                                    })}
                                    target="_blank"
                                    rel="noopener"
                                    endIcon={
                                        <OpenNewWindow
                                            style={{ fontSize: 14 }}
                                        />
                                    }
                                >
                                    <FormattedMessage id="connectorTable.actionsCta.connectorRequest" />
                                </Button>
                            }
                            title={
                                <ConnectorCardTitle
                                    title={intl.formatMessage({
                                        id: 'connectorTable.data.connectorRequest',
                                    })}
                                />
                            }
                        />
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
                            lg={2}
                            xl={2}
                            sx={{ maxWidth: 275 }}
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
                                semiTransparentBackground[theme.palette.mode],
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
