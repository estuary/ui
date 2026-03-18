import type { ConnectorCardsProps } from 'src/components/connectors/Grid/types';
import type { TableState } from 'src/types';
import type {
    ConnectorsQueryResponse,
    ConnectorsQueryVariables,
} from 'src/types/gql';

import { useEffect, useMemo, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { gql, useQuery } from 'urql';

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
import { TableStatuses } from 'src/types';
import { hasLength } from 'src/utils/misc-utils';
import {
    getEmptyTableHeader,
    getEmptyTableMessage,
} from 'src/utils/table-utils';

const connectorsQuery = gql<ConnectorsQueryResponse, ConnectorsQueryVariables>`
    query ConnectorsGrid($protocol: String) {
        connectors(filter: { protocol: { eq: $protocol } }) {
            edges {
                node {
                    imageName
                    createdAt
                    defaultImageTag
                    externalUrl
                    logoUrl
                    longDescription
                    recommended
                    shortDescription
                    title
                    tags {
                        imageTag
                        protocol
                        specSucceeded
                    }
                    connectorTag(orDefault: false, imageTag: "") {
                        createdAt
                        disableBackfill
                        documentationUrl
                        imageTag
                        protocol
                        updatedAt
                    }
                }
            }
        }
    }
`;

export default function ConnectorCards({
    condensed,
    protocol,
    searchQuery,
}: ConnectorCardsProps) {
    const navigateToCreate = useEntityCreateNavigate();

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const [{ fetching, data, error }] = useQuery({
        query: connectorsQuery,
        variables: protocol ? { protocol } : {},
    });

    const selectData = useMemo(() => {
        const nodes = data?.connectors.edges.map(({ node }) => node) ?? [];

        if (!searchQuery) return nodes;

        // TODO (gql:connector) - try to get this into the query
        const queryValue = searchQuery.toLowerCase();
        return nodes.filter(
            (node) =>
                node.title.toLowerCase().includes(queryValue) ||
                node.shortDescription?.toLowerCase().includes(queryValue)
        );
    }, [data, searchQuery]);

    const RequestCard = condensed ? (
        <div key="connector-tile-request" />
    ) : (
        <ConnectorRequestCard key="connector-tile-request" />
    );

    const primaryCtaClick = (nodeProtocol: string, imageName: string) => {
        // TODO (gql:connector) - we could still use `id` for connector but probably
        //  can switch over to the imageName instead
        navigateToCreate(nodeProtocol as any, {
            id: imageName,
            advanceToForm: true,
            expressWorkflow: condensed,
        });
    };

    useEffect(() => {
        if (fetching) return;

        if (selectData.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
        } else if (searchQuery) {
            setTableState({ status: TableStatuses.UNMATCHED_FILTER });
        } else if (error?.networkError) {
            setTableState({ status: TableStatuses.NETWORK_FAILED });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [selectData, fetching, error, searchQuery]);

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
                    const ConnectorCard = condensed ? Card : LegacyCard;
                    const nodeProtocol =
                        node.connectorTag?.protocol ?? node.tags[0]?.protocol;

                    console.log('node', node);

                    return (
                        <ConnectorCard
                            key={`connector-card-${node.imageName}`}
                            docsUrl={node.connectorTag?.documentationUrl}
                            clickHandler={() =>
                                primaryCtaClick(nodeProtocol, node.imageName)
                            }
                            Detail={
                                <Detail content={node.shortDescription ?? ''} />
                            }
                            entityType={nodeProtocol}
                            Logo={
                                <Logo
                                    imageSrc={node.logoUrl}
                                    maxHeight={condensed ? '100%' : undefined}
                                />
                            }
                            recommended={node.recommended}
                            Title={
                                <Title
                                    content={node.title}
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
