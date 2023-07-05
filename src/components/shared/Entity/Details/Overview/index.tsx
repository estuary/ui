import { CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import { DataPreview } from 'components/collection/DataPreview';
import ConnectorLogo from 'components/connectors/card/Logo';
import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import { tooltipSX } from 'components/graphs/tooltips';
import KeyValueList from 'components/shared/KeyValueList';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useDetailsNavigator from 'hooks/useDetailsNavigator';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { hasLength, specContainsDerivation } from 'utils/misc-utils';
import ShardInformation from '../../Shard/Information';
import Endpoints from '../Endpoints';
import Usage from '../Usage';

// TODO (details page)
// Temporary - allow to pass in the name
interface Props {
    name?: string;
}

function Overview({ name }: Props) {
    const intl = useIntl();

    const entityType = useEntityType();
    const isCollection = entityType === 'collection';
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const entityName = name ?? catalogName;
    const { liveSpecs, isValidating: validatingLiveSpecs } = useLiveSpecs(
        entityType,
        entityName
    );

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogSpec = currentCatalog?.spec ?? null;
    const { isDerivation } = specContainsDerivation(catalogSpec);

    const latestLiveSpec = useMemo(
        () =>
            !validatingLiveSpecs && hasLength(liveSpecs) ? liveSpecs[0] : null,
        [liveSpecs, validatingLiveSpecs]
    );

    const { generatePath } = useDetailsNavigator(
        authenticatedRoutes.captures.details.overview.fullPath
    );

    // const foo = generatePath({
    //     catalog_name: entityName,
    //     last_pub_id:
    // });

    console.log('foo', generatePath);

    return (
        <Grid container spacing={2}>
            <Endpoints name={entityName} />

            <Grid item xs={8}>
                <Usage
                    catalogName={entityName}
                    createdAt={latestLiveSpec?.created_at}
                />
            </Grid>

            <Grid item xs={4}>
                {!latestLiveSpec ? (
                    <CircularProgress />
                ) : (
                    <Stack
                        direction="column"
                        spacing={2}
                        sx={{ ...tooltipSX, m: 2 }}
                    >
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
                                    imageSrc={
                                        latestLiveSpec.connector_logo_url[
                                            'en-us'
                                        ]
                                    }
                                    maxHeight={35}
                                    padding="0 0.5rem"
                                    unknownConnectorIconConfig={{
                                        width: 51,
                                        fontSize: 24,
                                    }}
                                />
                            ) : null}

                            <KeyValueList
                                data={[
                                    {
                                        title: intl.formatMessage({
                                            id: 'data.updated_at',
                                        }),
                                        val: `${intl.formatDate(
                                            latestLiveSpec.updated_at,
                                            {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            }
                                        )} by ${
                                            latestLiveSpec.last_pub_user_email
                                        }`,
                                    },
                                    {
                                        title: intl.formatMessage({
                                            id: 'data.created_at',
                                        }),
                                        val: intl.formatDate(
                                            latestLiveSpec.created_at,
                                            {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                            }
                                        ),
                                    },
                                    {
                                        title: intl.formatMessage({
                                            id: latestLiveSpec.writes_to
                                                ? 'data.writes_to'
                                                : latestLiveSpec.reads_from
                                                ? 'data.reads_from'
                                                : 'common.missing',
                                        }),
                                        val: latestLiveSpec.writes_to
                                            ? latestLiveSpec.writes_to.join(
                                                  ', '
                                              )
                                            : latestLiveSpec.reads_from
                                            ? latestLiveSpec.reads_from.join(
                                                  ', '
                                              )
                                            : '',
                                    },
                                ]}
                            />
                        </CardWrapper>
                    </Stack>
                )}
            </Grid>

            {!isCollection || isDerivation ? (
                <Grid item xs={12}>
                    <ShardInformation entityType={entityType} />
                </Grid>
            ) : null}

            {isCollection && entityName ? (
                <Grid item xs={12}>
                    <DataPreview collectionName={entityName} />
                </Grid>
            ) : null}
        </Grid>
    );
}

export default Overview;
