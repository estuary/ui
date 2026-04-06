import type { ConnectorCardsProps } from 'src/components/connectors/Grid/types';
import type { ConnectorProto } from 'src/gql-types/graphql';
import type { EntityWithCreateWorkflow, TableState } from 'src/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useQuery } from 'urql';

import { CONNECTORS_QUERY } from 'src/api/gql/connectors';
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

    const variables = useMemo(
        () => ({
            filter: protocol
                ? { protocol: { eq: protocol as ConnectorProto } }
                : undefined,
        }),
        [protocol]
    );

    const [{ data: queryData, fetching, error }] = useQuery({
        query: CONNECTORS_QUERY,
        variables,
    });

    const selectData = useMemo(() => {
        const nodes = (queryData?.connectors.edges ?? [])
            .map((edge) => edge.node)
            .filter(
                (
                    node
                ): node is typeof node & {
                    connectorTag: NonNullable<typeof node.connectorTag>;
                } => node.connectorTag !== null
            );

        if (!searchQuery) return nodes;

        const q = searchQuery.toLowerCase();
        return nodes.filter(
            (node) =>
                node.title?.toLowerCase().includes(q) ||
                node.shortDescription?.toLowerCase().includes(q)
        );
    }, [queryData, searchQuery]);

    const RequestCard = condensed ? (
        <div key="connector-tile-request" />
    ) : (
        <ConnectorRequestCard key="connector-tile-request" />
    );

    const primaryCtaClick = (
        entityType: EntityWithCreateWorkflow,
        connectorId: string
    ) => {
        navigateToCreate(entityType, {
            id: connectorId,
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
    }, [selectData, fetching, error?.message]);

    if (fetching || tableState.status === TableStatuses.LOADING) {
        return <ConnectorSkeleton condensed={condensed} />;
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
                .map((node) => {
                    const { connectorTag } = node;
                    const ConnectorCard = condensed ? Card : LegacyCard;
                    const entityType = connectorTag.protocol;

                    // TODO (GQL:connector) how to better handle with typing?
                    if (!entityType) {
                        return null;
                    }

                    return (
                        <ConnectorCard
                            key={`connector-card-${node.id}`}
                            clickHandler={() =>
                                primaryCtaClick(
                                    entityType,
                                    connectorTag.connectorId
                                )
                            }
                            docsUrl={connectorTag.documentationUrl ?? ''}
                            entityType={entityType}
                            recommended={node.recommended}
                            Detail={
                                <Detail content={node.shortDescription ?? ''} />
                            }
                            Logo={
                                <Logo
                                    imageSrc={node.logoUrl ?? ''}
                                    maxHeight={condensed ? '100%' : undefined}
                                />
                            }
                            Title={
                                <Title
                                    content={node.title ?? ''}
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
