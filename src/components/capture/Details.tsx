import { Alert, Grid } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { DEFAULT_TOTAL_HEIGHT } from 'components/editor/MonacoEditor';
import { EditorStoreState } from 'components/editor/Store';
import Logs from 'components/Logs';
import Error from 'components/shared/Error';
import useBrowserTitle from 'hooks/useBrowserTitle';
import usePublications from 'hooks/usePublications';
import usePublicationSpecs, {
    PublicationSpecQuery,
} from 'hooks/usePublicationSpecs';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    lastPubId: string;
    disableLogs?: boolean;
}

function CaptureDetails({ lastPubId, disableLogs }: Props) {
    useBrowserTitle('browserTitle.captureDetails');

    const { publicationSpecs, error: pubSpecsError } =
        usePublicationSpecs(lastPubId);
    const { publications, error: pubsError } = usePublications(lastPubId);

    const setSpecs = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['setSpecs']
    >((state) => state.setSpecs);

    const setId = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['setId']
    >((state) => state.setId);

    useEffect(() => {
        setId(lastPubId);
    }, [lastPubId, setId]);

    useEffect(() => {
        if (publicationSpecs.length > 0) {
            setSpecs(publicationSpecs.map((item) => item.live_specs));
        }
    }, [publicationSpecs, setSpecs]);

    if (pubSpecsError) {
        return <Error error={pubSpecsError} />;
    } else {
        return (
            <Grid container spacing={2}>
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
