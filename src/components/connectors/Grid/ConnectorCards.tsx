import type { ConnectorWithTagQuery } from 'src/api/types';
import type { ConnectorCardsProps } from 'src/components/connectors/Grid/types';
import type { TableState } from 'src/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { FormattedMessage } from 'react-intl';

import { getConnectors } from 'src/api/connectors';
import Card from 'src/components/connectors/Grid/cards/Card';
import ConnectorRequestCard from 'src/components/connectors/Grid/cards/ConnectorRequestCard';
import Detail from 'src/components/connectors/Grid/cards/Detail';
import LegacyCard from 'src/components/connectors/Grid/cards/LegacyCard';
import Logo from 'src/components/connectors/Grid/cards/Logo';
import Title from 'src/components/connectors/Grid/cards/Title';
import { intlConfig } from 'src/components/connectors/Grid/shared';
import ConnectorSkeleton from 'src/components/connectors/Grid/Skeleton';
import useEntityCreateNavigate from 'src/components/shared/Entity/hooks/useEntityCreateNavigate';
import { semiTransparentBackground } from 'src/context/Theme';
import { checkErrorMessage, FAILED_TO_FETCH } from 'src/services/shared';
import { TableStatuses } from 'src/types';
import { hasLength } from 'src/utils/misc-utils';
import {
    getEmptyTableHeader,
    getEmptyTableMessage,
} from 'src/utils/table-utils';

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

    const RequestCard = condensed ? (
        <div key="connector-tile-request" />
    ) : (
        <ConnectorRequestCard key="connector-tile-request" />
    );

    const primaryCtaClick = (row: ConnectorWithTagQuery) => {
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
        return <ConnectorSkeleton condensed={condensed} />;
    }

    if (!hasLength(selectData)) {
        return (
            <Grid sx={{ width: '100%' }}>
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
                .concat(RequestCard)}
        </>
    );
}
