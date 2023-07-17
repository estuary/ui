import { CircularProgress, Skeleton, Stack, Typography } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import RelatedCollections from 'components/shared/Entity/RelatedCollections';
import ExternalLink from 'components/shared/ExternalLink';
import KeyValueList from 'components/shared/KeyValueList';
import { LiveSpecsQuery } from 'hooks/useLiveSpecs';
import { useMemo } from 'react';
import { FormatDateOptions, FormattedMessage, useIntl } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

interface Props {
    entityName: string;
    latestLiveSpec: LiveSpecsQuery | null;
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
                        <Typography>{latestLiveSpec.connectorName}</Typography>
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
