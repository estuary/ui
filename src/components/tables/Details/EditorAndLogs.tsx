import { Alert, Grid } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { DEFAULT_TOTAL_HEIGHT } from 'components/editor/MonacoEditor';
import { EditorStoreState } from 'components/editor/Store';
import Logs from 'components/Logs';
import Error from 'components/shared/Error';
import usePublications from 'hooks/usePublications';
import usePublicationSpecs, {
    PublicationSpecQuery,
} from 'hooks/usePublicationSpecs';
import {
    CaptureStoreNames,
    MaterializationStoreNames,
    useZustandStore,
} from 'hooks/useZustand';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    lastPubId: string;
    draftEditorStoreName:
        | CaptureStoreNames.DRAFT_SPEC_EDITOR
        | MaterializationStoreNames.DRAFT_SPEC_EDITOR;
    disableLogs?: boolean;
}

function EditorAndLogs({
    lastPubId,
    draftEditorStoreName,
    disableLogs,
}: Props) {
    const { publicationSpecs, error: pubSpecsError } =
        usePublicationSpecs(lastPubId);
    const { publication: publications, error: pubsError } =
        usePublications(lastPubId);

    const setSpecs = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['setSpecs']
    >(draftEditorStoreName, (state) => state.setSpecs);

    const setId = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['setId']
    >(draftEditorStoreName, (state) => state.setId);

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
                        draftEditorStoreName={draftEditorStoreName}
                    />
                </Grid>

                <Grid item xs={6}>
                    {pubsError ? (
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
