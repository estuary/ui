import { CircularProgress, Stack } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import ExternalLink from 'components/shared/ExternalLink';
import KeyValueList from 'components/shared/KeyValueList';
import { LiveSpecsQuery } from 'hooks/useLiveSpecs';
import { useMemo } from 'react';
import { FormatDateOptions, FormattedMessage, useIntl } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import RelatedCollections from '../../RelatedCollections';

interface Props {
    entityName: string;
    latestLiveSpec: LiveSpecsQuery | null;
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

        if (latestLiveSpec) {
            // Add last updated - without user as Estuary folks
            //  sometimes update stuff and that might look odd
            response.push({
                title: intl.formatMessage({
                    id: 'entityTable.data.lastUpdated',
                }),
                val: `${intl.formatDate(
                    latestLiveSpec.updated_at,
                    TIME_SETTINGS
                )}`,
            });

            // At when it was created
            response.push({
                title: intl.formatMessage({
                    id: 'data.created_at',
                }),
                val: intl.formatDate(latestLiveSpec.created_at, TIME_SETTINGS),
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
        <CardWrapper
            height={undefined}
            message={<FormattedMessage id="detailsPanel.details.title" />}
        >
            {/*                <Grid
                    container
                    component="dl" // mount a Definition List
                    spacing={1}
                >
                    {data.map((datum) => {
                        return (
                            <Grid
                                item
                                key={`detail-section-${datum.title}`}
                                xs={3}
                                md={12}
                            >
                                <Typography component="dt" variant="h6">
                                    {datum.title}
                                </Typography>
                                <Typography component="dd" variant="body2">
                                    {datum.val}
                                </Typography>
                            </Grid>
                        );
                    })}
                </Grid>*/}
            <KeyValueList data={data} />
        </CardWrapper>
    );
}

export default DetailsSection;
