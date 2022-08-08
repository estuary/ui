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
    usePublicationSpecs_relatedCollections,
} from 'hooks/usePublicationSpecs';
import { concat } from 'lodash';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { ENTITY } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    lastPubId: string;
    liveSpecEditorStoreName: LiveSpecEditorStoreNames;
    useZustandStore: UseZustandStore;
    liveSpecId?: string;
    disableLogs?: boolean;
    collectionNames?: string[];
    entityType: ENTITY;
}

function EditorAndLogs({
    lastPubId,
    liveSpecEditorStoreName,
    useZustandStore,
    liveSpecId,
    disableLogs,
    collectionNames,
    entityType,
}: Props) {
    const { publicationSpecs, error: pubSpecsError } = usePublicationSpecs({
        lastPubId,
        liveSpecId,
        collectionNames,
        entityType,
    });
    const { collectionSpecs, error: collectionSpecsError } =
        usePublicationSpecs_relatedCollections({
            lastPubId,
            liveSpecId,
            collectionNames,
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
        let newSpecs: any[] = [];

        if (publicationSpecs.length > 0) {
            newSpecs = publicationSpecs.map((item) => item.live_specs);

            if (collectionSpecs.length > 0) {
                newSpecs = concat(
                    newSpecs,
                    collectionSpecs.map((item) => item.live_specs)
                );
            }
        }

        if (hasLength(newSpecs)) {
            console.log('setting specs to', {
                newSpecs,
                publicationSpecs,
                collectionSpecs,
            });
            setSpecs(newSpecs);
        }
    }, [collectionSpecs, publicationSpecs, setSpecs]);

    if (pubSpecsError || collectionSpecsError) {
        return <Error error={pubSpecsError ?? collectionSpecsError} />;
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
