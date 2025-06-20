import type { DetailsSectionProps } from 'src/components/shared/Entity/Details/Overview/DetailsSection/types';

import { useMemo } from 'react';

import { CircularProgress, Skeleton, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ConnectorName from 'src/components/connectors/ConnectorName';
import CardWrapper from 'src/components/shared/CardWrapper';
import DataPlane from 'src/components/shared/Entity/DataPlane';
import { TIME_SETTINGS } from 'src/components/shared/Entity/Details/Overview/DetailsSection/shared';
import useRelatedEntities from 'src/components/shared/Entity/Details/useRelatedEntities';
import ExternalLink from 'src/components/shared/ExternalLink';
import KeyValueList from 'src/components/shared/KeyValueList';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityStatusStore_singleResponse } from 'src/stores/EntityStatus/hooks';
import {
    formatDataPlaneName,
    getDataPlaneScope,
    parseDataPlaneName,
} from 'src/utils/dataPlane-utils';
import { hasLength } from 'src/utils/misc-utils';

function DetailsSection({ entityName, latestLiveSpec }: DetailsSectionProps) {
    const intl = useIntl();

    const entityType = useEntityType();

    const latestConnectorStatus =
        useEntityStatusStore_singleResponse(entityName)?.connector_status
            ?.message;

    const relatedEntities = useRelatedEntities();

    const data = useMemo(() => {
        const response = [];

        // If there is nothing to show then display the loading status
        if (!latestLiveSpec) {
            response.push(
                {
                    title: <Skeleton width="33%" />,
                    val: <Skeleton width="75%" />,
                },
                {
                    title: <Skeleton width="33%" sx={{ opacity: '66%' }} />,
                    val: <Skeleton width="75%" sx={{ opacity: '66%' }} />,
                },
                {
                    title: <Skeleton width="33%" sx={{ opacity: '33%' }} />,
                    val: <Skeleton width="75%" sx={{ opacity: '33%' }} />,
                }
            );
            return response;
        }

        if (latestLiveSpec.connectorName) {
            response.push({
                title: intl.formatMessage({
                    id: 'connector.label',
                }),
                val: (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: 'center',
                        }}
                    >
                        <ConnectorName
                            iconPath={latestLiveSpec.connector_logo_url}
                            iconSize={20}
                            marginRight={1}
                            title={latestLiveSpec.connectorName}
                        />

                        {latestLiveSpec.connector_tag_documentation_url ? (
                            <ExternalLink
                                link={
                                    latestLiveSpec.connector_tag_documentation_url
                                }
                            >
                                {intl.formatMessage({
                                    id: 'terms.documentation',
                                })}
                            </ExternalLink>
                        ) : null}
                    </Stack>
                ),
            });
        }

        if (entityType !== 'collection') {
            response.push({
                title: intl.formatMessage({
                    id: 'data.connectorStatus',
                }),
                val: (
                    <Typography component="div">
                        {latestConnectorStatus ?? '--'}
                    </Typography>
                ),
            });
        }

        if (hasLength(latestLiveSpec.data_plane_name)) {
            const dataPlaneScope = getDataPlaneScope(
                latestLiveSpec.data_plane_name
            );

            const dataPlaneName = parseDataPlaneName(
                latestLiveSpec.data_plane_name,
                dataPlaneScope
            );

            response.push({
                title: intl.formatMessage({ id: 'data.dataPlane' }),
                val: (
                    <DataPlane
                        dataPlaneName={dataPlaneName}
                        formattedSuffix={formatDataPlaneName(dataPlaneName)}
                        logoSize={20}
                        scope={dataPlaneScope}
                    />
                ),
            });
        }

        // Add last updated - without user as Estuary folks
        //  sometimes update stuff and that might look odd
        response.push({
            title: intl.formatMessage({
                id: 'entityTable.data.lastUpdated',
            }),
            val: `${intl.formatDate(latestLiveSpec.updated_at, TIME_SETTINGS)}`,
        });

        // At when it was created
        response.push({
            title: intl.formatMessage({
                id: 'data.created_at',
            }),
            val: intl.formatDate(latestLiveSpec.created_at, TIME_SETTINGS),
        });

        return response;
    }, [entityType, intl, latestConnectorStatus, latestLiveSpec]);

    return (
        <CardWrapper
            message={
                <span>
                    {intl.formatMessage({ id: 'detailsPanel.details.title' })}
                </span>
            }
        >
            {!hasLength(data) ? (
                <CircularProgress />
            ) : (
                <KeyValueList data={[...data, ...relatedEntities]} />
            )}
        </CardWrapper>
    );
}

export default DetailsSection;
