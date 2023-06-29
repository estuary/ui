import { CircularProgress, Grid, Stack, Typography } from '@mui/material';
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
import useLiveSpecs from 'hooks/useLiveSpecs';
import { FormattedMessage, useIntl } from 'react-intl';
import { specContainsDerivation } from 'utils/misc-utils';
import ShardInformation from '../Shard/Information';
import Endpoints from './Endpoints';
import Usage from './Usage';

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

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogSpec = currentCatalog?.spec ?? null;
    const { isDerivation } = specContainsDerivation(catalogSpec);

    const { liveSpecs, isValidating: validatingLiveSpecs } = useLiveSpecs(
        entityType,
        entityName
    );

    return (
        <Grid container spacing={2}>
            <Endpoints name={entityName} />

            <Grid item xs={9}>
                <Usage catalogName={entityName} />
            </Grid>

            <Grid item xs={3}>
                {validatingLiveSpecs ? (
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
                            {liveSpecs[0].connector_logo_url ? (
                                <ConnectorLogo
                                    imageSrc={
                                        liveSpecs[0].connector_logo_url['en-us']
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
                                            liveSpecs[0].updated_at,
                                            {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            }
                                        )} by ${
                                            liveSpecs[0].last_pub_user_email
                                        }`,
                                    },
                                    {
                                        title: intl.formatMessage({
                                            id: 'data.created_at',
                                        }),
                                        val: intl.formatDate(
                                            liveSpecs[0].created_at,
                                            {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            }
                                        ),
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
