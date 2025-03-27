import { Grid, Paper, Typography } from '@mui/material';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getConnectors } from 'api/connectors';
import LegacyCard from 'components/connectors/Grid/cards/LegacyCard';
import useEntityCreateNavigate from 'components/shared/Entity/hooks/useEntityCreateNavigate';
import { semiTransparentBackground } from 'context/Theme';
import { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { checkErrorMessage, FAILED_TO_FETCH } from 'services/shared';

import { TableState, TableStatuses } from 'types';
import { hasLength } from 'utils/misc-utils';
import { getEmptyTableHeader, getEmptyTableMessage } from 'utils/table-utils';
import Card from './cards/Card';
import ConnectorRequestCard from './cards/ConnectorRequestCard';
import Detail from './cards/Detail';
import Logo from './cards/Logo';
import Title from './cards/Title';
import { intlConfig } from './shared';
import ConnectorsSkeleton from './Skeleton';
import { ConnectorCardsProps } from './types';

export default function ConnectorCards({
    condensed,
    protocol,
    searchQuery,
}: ConnectorCardsProps) {
    const navigateToCreate = useEntityCreateNavigate();
    const isFiltering = useRef(false);

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
            expressWorkflow: condensed,
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

    if (isValidating || tableState.status === TableStatuses.LOADING) {
        return <ConnectorsSkeleton />;
    }

    if (!hasLength(selectData)) {
        return (
            <Grid item sx={{ width: '100%' }}>
                <Paper
                    elevation={0}
                    sx={{
                        height: 300,
                        borderRadius: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        background: (theme) =>
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
                        {getEmptyTableMessage(tableState.status, intlConfig)}
                    </Typography>
                </Paper>
            </Grid>
        );
    }

    return (
        <>
            {selectData
                .map((row) => {
                    const ConnectorCard = condensed ? Card : LegacyCard;

                    return (
                        <ConnectorCard
                            key={`connector-card-${row.id}`}
                            docsUrl={row.connector_tags[0].documentation_url}
                            clickHandler={() => primaryCtaClick(row)}
                            Detail={<Detail content={row.detail} />}
                            entityType={row.connector_tags[0].protocol}
                            Logo={
                                <Logo
                                    imageSrc={row.image}
                                    maxHeight={condensed ? '100%' : undefined}
                                />
                            }
                            recommended={row.recommended}
                            Title={
                                <Title
                                    content={row.title}
                                    marginBottom={condensed ? '4px' : undefined}
                                />
                            }
                        />
                    );
                })
                .concat(
                    <ConnectorRequestCard
                        key="connector-tile-request"
                        condensed={condensed}
                    />
                )}
        </>
    );
}
