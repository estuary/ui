import {
    Grid,
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getConnectors } from 'api/connectors';
import ConnectorCard from 'components/connectors/card';
import ConnectorToolbar from 'components/connectors/ConnectorToolbar';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import { semiTransparentBackground } from 'context/Theme';
import { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { checkErrorMessage, FAILED_TO_FETCH } from 'services/shared';

import {
    EntityWithCreateWorkflow,
    TableIntlConfig,
    TableState,
    TableStatuses,
} from 'types';
import { hasLength } from 'utils/misc-utils';
import { getEmptyTableHeader, getEmptyTableMessage } from 'utils/table-utils';
import ConnectorCardDetails from './card/Details';
import ConnectorLogo from './card/Logo';
import ConnectorCardTitle from './card/Title';
import ConnectorRequestTile from './ConnectorRequestTile';
import ConnectorsSkeleton from './Skeleton';

interface ConnectorTilesProps {
    protocolPreset?: EntityWithCreateWorkflow;
}

const intlConfig: TableIntlConfig = {
    header: 'connectors.main.message1',
    message: 'connectors.main.message2',
};

function ConnectorTiles({ protocolPreset }: ConnectorTilesProps) {
    const navigateToCreate = useEntityCreateNavigate();
    const isFiltering = useRef(false);

    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const [protocol, setProtocol] = useState<string | null>(
        protocolPreset ?? null
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const query = useMemo(() => {
        return getConnectors(searchQuery, 'asc', protocol);
    }, [searchQuery, protocol]);

    const { data: selectResponse, isValidating, error } = useQuery(query);

    const selectData = useMemo(() => selectResponse ?? [], [selectResponse]);

    const primaryCtaClick = (row: ConnectorWithTagDetailQuery) => {
        navigateToCreate(row.connector_tags[0].protocol, {
            id: row.connector_tags[0].connector_id,
            advanceToForm: true,
        });
    };

    useEffect(() => {
        if (selectData.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
        } else if (isFiltering.current) {
            setTableState({ status: TableStatuses.UNMATCHED_FILTER });
        } else if (checkErrorMessage(FAILED_TO_FETCH, error?.message)) {
            setTableState({ status: TableStatuses.NETWORK_FAILED });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [selectData, isValidating, error?.message]);

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
                    hideProtocol={!!protocolPreset}
                    setProtocol={setProtocol}
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
                                />
                            }
                            recommended={row.recommended}
                            specType={row.connector_tags[0].protocol}
                            clickHandler={() => primaryCtaClick(row)}
                        />
                    ))
                    .concat(
                        <ConnectorRequestTile key="connector-tile-request" />
                    )
            ) : isValidating || tableState.status === TableStatuses.LOADING ? (
                <ConnectorsSkeleton />
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
