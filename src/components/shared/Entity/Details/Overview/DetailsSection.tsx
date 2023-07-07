import { CircularProgress, Divider, Stack, Typography } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import ConnectorLogo from 'components/connectors/card/Logo';
import { tooltipSX } from 'components/graphs/tooltips';
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
            <Stack direction="row" spacing={1}>
                <Typography
                    component="span"
                    variant="h6"
                    sx={{
                        alignItems: 'center',
                    }}
                >
                    <FormattedMessage id="detailsPanel.details.title" />
                </Typography>
            </Stack>
            <CardWrapper>
                {latestLiveSpec.connector_logo_url ? (
                    <ConnectorLogo
                        imageSrc={latestLiveSpec.connector_logo_url['en-us']}
                        maxHeight={35}
                        padding="0 0.5rem"
                        unknownConnectorIconConfig={{
                            width: 51,
                            fontSize: 24,
                        }}
                    />
                ) : null}

                <Divider />

                <KeyValueList data={data} />
            </CardWrapper>
        </Stack>
    );
}

export default DetailsSection;
