import type { FormatDateOptions } from 'react-intl';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { useMemo } from 'react';

import { CircularProgress, Skeleton, Stack } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import ConnectorName from 'src/components/connectors/ConnectorName';
import CardWrapper from 'src/components/shared/CardWrapper';
import DataPlane from 'src/components/shared/Entity/DataPlane';
import RelatedCollections from 'src/components/shared/Entity/RelatedCollections';
import ExternalLink from 'src/components/shared/ExternalLink';
import KeyValueList from 'src/components/shared/KeyValueList';
import {
    formatDataPlaneName,
    getDataPlaneScope,
    parseDataPlaneName,
} from 'src/utils/dataPlane-utils';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    entityName: string;
    latestLiveSpec: LiveSpecsQuery_details | null;
    loading: boolean;
}

const TIME_SETTINGS: FormatDateOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
};

function DetailsSection({ latestLiveSpec }: Props) {
    const intl = useIntl();

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
                                <FormattedMessage id="terms.documentation" />
                            </ExternalLink>
                        ) : null}
                    </Stack>
                ),
            });
        }

        if (hasLength(latestLiveSpec.writes_to)) {
            response.push({
                title: intl.formatMessage({
                    id: 'data.writes_to',
                }),
                val: (
                    <RelatedCollections
                        collections={latestLiveSpec.writes_to}
                    />
                ),
            });
        }

        if (hasLength(latestLiveSpec.reads_from)) {
            response.push({
                title: intl.formatMessage({
                    id: 'data.reads_from',
                }),
                val: (
                    <RelatedCollections
                        collections={latestLiveSpec.reads_from}
                    />
                ),
            });
        }

        return response;
    }, [intl, latestLiveSpec]);

    return (
        <CardWrapper
            message={<FormattedMessage id="detailsPanel.details.title" />}
        >
            {!hasLength(data) ? (
                <CircularProgress />
            ) : (
                <KeyValueList data={data} />
            )}
        </CardWrapper>
    );
}

export default DetailsSection;
