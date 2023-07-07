import { CircularProgress, Stack } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import { tooltipSX } from 'components/graphs/tooltips';
import ExternalLink from 'components/shared/ExternalLink';
import KeyValueList from 'components/shared/KeyValueList';
import { LiveSpecsQuery } from 'hooks/useLiveSpecs';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import RelatedCollections from '../../RelatedCollections';

interface Props {
    entityName: string;
    latestLiveSpec: LiveSpecsQuery | null;
}

function DetailsSection({ latestLiveSpec }: Props) {
    const intl = useIntl();

    const data = useMemo(() => {
        const response = [];

        if (latestLiveSpec) {
            // Add last updated - without user as Estuary folks
            //  sometimes update stuff and that might look odd
            response.push({
                title: intl.formatMessage({
                    id: 'entityTable.data.lastUpdated',
                }),
                val: `${intl.formatDate(latestLiveSpec.updated_at, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })}`,
            });

            // At when it was created
            response.push({
                title: intl.formatMessage({
                    id: 'data.created_at',
                }),
                val: intl.formatDate(latestLiveSpec.created_at, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                }),
            });

            if (latestLiveSpec.connector_title?.['en-US']) {
                response.push({
                    title: intl.formatMessage({
                        id: 'connector.label',
                    }),
                    val: (
                        <Stack direction="row" spacing={2}>
                            {latestLiveSpec.connector_title['en-US']}
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
        }

        return response;
    }, [intl, latestLiveSpec]);

    if (!latestLiveSpec) {
        return <CircularProgress />;
    }

    return (
        <Stack direction="column" spacing={2} sx={{ ...tooltipSX, m: 2 }}>
            <CardWrapper
                message={<FormattedMessage id="detailsPanel.details.title" />}
            >
                <KeyValueList data={data} />
            </CardWrapper>
        </Stack>
    );
}

export default DetailsSection;
