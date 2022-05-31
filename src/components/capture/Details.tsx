import { Alert, Box, Grid } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { DEFAULT_TOTAL_HEIGHT } from 'components/editor/MonacoEditor';
import { EditorStoreState } from 'components/editor/Store';
import Logs from 'components/Logs';
import Error from 'components/shared/Error';
// import { slate } from 'context/Theme';
import useBrowserTitle from 'hooks/useBrowserTitle';
import usePublications from 'hooks/usePublications';
import usePublicationSpecs, {
    PublicationSpecQuery,
} from 'hooks/usePublicationSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ShardDetails, shardDetailSelectors } from 'stores/ShardDetail';

interface Props {
    lastPubId: string;
    disableLogs?: boolean;
}

function CaptureDetails({ lastPubId, disableLogs }: Props) {
    const [shardDetails, setShardDetails] = useState<ShardDetails | null>(null);

    useBrowserTitle('browserTitle.captureDetails');

    const shardDetailStore = useRouteStore();
    const getShardDetails = shardDetailStore(
        shardDetailSelectors.getShardDetails
    );

    const { publicationSpecs, error: pubSpecsError } =
        usePublicationSpecs(lastPubId);
    const { publication: publications, error: pubsError } =
        usePublications(lastPubId);

    const setSpecs = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['setSpecs']
    >((state) => state.setSpecs);

    const specs = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['specs']
    >((state) => state.specs);
    console.log('SPECS');
    console.log(specs);

    const setId = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['setId']
    >((state) => state.setId);

    useEffect(() => {
        setId(lastPubId);
    }, [lastPubId, setId]);

    useEffect(() => {
        if (publicationSpecs.length > 0) {
            setSpecs(
                publicationSpecs.map((item) => {
                    console.log('LIVE SPECS');
                    console.log(item.live_specs);
                    return item.live_specs;
                })
            );
        }
    }, [publicationSpecs, setSpecs]);

    useEffect(() => {
        if (specs && specs.length > 0) {
            setShardDetails(
                getShardDetails(
                    specs.find(({ spec_type }) => spec_type === 'capture')
                        ?.catalog_name
                )
            );
        }
    }, [specs, getShardDetails, setShardDetails]);

    if (pubSpecsError) {
        return <Error error={pubSpecsError} />;
    } else {
        return (
            <Grid container spacing={2}>
                {shardDetails && (
                    <>
                        <Grid item>
                            {shardDetails.errors && (
                                <Alert variant="filled" severity="error">
                                    {shardDetails.errors}
                                </Alert>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    px: 1,
                                    py: 2,
                                    bgcolor: 'background.paper',
                                    borderRadius: '2px',
                                }}
                            >
                                <span
                                    style={{ marginRight: 8, fontWeight: 500 }}
                                >
                                    <FormattedMessage id="captureDetails.shardDetails.title" />
                                </span>

                                <span>{shardDetails.id}</span>
                            </Box>
                        </Grid>
                    </>
                )}

                <Grid item xs={disableLogs ? 12 : 6}>
                    <LiveSpecEditor />
                </Grid>

                <Grid item xs={6}>
                    {pubsError ? (
                        <Alert variant="filled" severity="warning">
                            <FormattedMessage id="captureDetails.logs.notFound" />
                        </Alert>
                    ) : !disableLogs && publications !== null ? (
                        <Logs
                            token={publications.logs_token}
                            fetchAll
                            disableIntervalFetching
                            height={DEFAULT_TOTAL_HEIGHT}
                        />
                    ) : null}
                </Grid>
            </Grid>
        );
    }
}

export default CaptureDetails;
