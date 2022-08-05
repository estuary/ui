import { Alert, Grid } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { DEFAULT_TOTAL_HEIGHT } from 'components/editor/MonacoEditor';
import { EditorStoreState } from 'components/editor/Store';
import Logs from 'components/Logs';
import Error from 'components/shared/Error';
import { LiveSpecEditorStoreNames, UseZustandStore } from 'context/Zustand';
import usePublications from 'hooks/usePublications';
import usePublicationSpecs, {
    PublicationSpecQuery,
} from 'hooks/usePublicationSpecs';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { ENTITY } from 'types';

interface Props {
    lastPubId: string;
    liveSpecEditorStoreName: LiveSpecEditorStoreNames;
    useZustandStore: UseZustandStore;
    specTypes?: ENTITY[];
    liveSpecId?: string;
    disableLogs?: boolean;
}

function EditorAndLogs({
    lastPubId,
    liveSpecEditorStoreName,
    useZustandStore,
    specTypes,
    liveSpecId,
    disableLogs,
}: Props) {
    const { publicationSpecs, error: pubSpecsError } = usePublicationSpecs({
        lastPubId,
        specTypes,
        liveSpecId,
    });
    const { publication: publications, error: pubsError } = usePublications(
        !disableLogs ? lastPubId : null
    );

    const setSpecs = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['setSpecs']
    >(liveSpecEditorStoreName, (state) => state.setSpecs);

    const setId = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['setId']
    >(liveSpecEditorStoreName, (state) => state.setId);

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
            <>
                <Grid item xs={disableLogs ? 12 : 6}>
                    <LiveSpecEditor
                        liveSpecEditorStoreName={liveSpecEditorStoreName}
                        useZustandStore={useZustandStore}
                    />
                </Grid>

                <Grid item xs={6}>
                    {pubsError && !disableLogs ? (
                        <Alert variant="filled" severity="warning">
                            <FormattedMessage id="detailsPanel.logs.notFound" />
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
            </>
        );
    }
}

export default EditorAndLogs;
