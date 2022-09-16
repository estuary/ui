import { Alert, Grid } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { DEFAULT_TOTAL_HEIGHT } from 'components/editor/MonacoEditor';
import { EditorStoreState } from 'components/editor/Store';
import Logs from 'components/logs';
import Error from 'components/shared/Error';
import { LiveSpecEditorStoreNames, UseZustandStore } from 'context/Zustand';
import { LiveSpecsQuery_spec, useLiveSpecs_spec } from 'hooks/useLiveSpecs';
import usePublications from 'hooks/usePublications';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

interface Props {
    lastPubId: string;
    liveSpecEditorStoreName: LiveSpecEditorStoreNames;
    useZustandStore: UseZustandStore;
    disableLogs?: boolean;
    collectionNames?: string[];
}

function EditorAndLogs({
    lastPubId,
    liveSpecEditorStoreName,
    useZustandStore,
    disableLogs,
    collectionNames,
}: Props) {
    const { liveSpecs: publicationSpecs, error: pubSpecsError } =
        useLiveSpecs_spec(collectionNames);
    const { publication: publications, error: pubsError } = usePublications(
        !disableLogs ? lastPubId : null
    );

    const setSpecs = useZustandStore<
        EditorStoreState<LiveSpecsQuery_spec>,
        EditorStoreState<LiveSpecsQuery_spec>['setSpecs']
    >(liveSpecEditorStoreName, (state) => state.setSpecs);

    const setId = useZustandStore<
        EditorStoreState<LiveSpecsQuery_spec>,
        EditorStoreState<LiveSpecsQuery_spec>['setId']
    >(liveSpecEditorStoreName, (state) => state.setId);

    useEffect(() => {
        setId(lastPubId);
    }, [lastPubId, setId]);

    useEffect(() => {
        if (hasLength(publicationSpecs)) {
            setSpecs(publicationSpecs);
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
