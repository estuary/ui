import { Grid } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { DEFAULT_TOTAL_HEIGHT } from 'components/editor/MonacoEditor';
import {
    useEditorStore_setId,
    useEditorStore_setSpecs,
} from 'components/editor/Store';
import Logs from 'components/logs';
import AlertBox from 'components/shared/AlertBox';
import Error from 'components/shared/Error';
import { useLiveSpecs_spec } from 'hooks/useLiveSpecs';
import usePublications from 'hooks/usePublications';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

interface Props {
    lastPubId: string;
    localZustandScope: boolean;
    disableLogs?: boolean;
    collectionNames?: string[];
}

function EditorAndLogs({
    lastPubId,
    localZustandScope,
    disableLogs,
    collectionNames,
}: Props) {
    const { liveSpecs: publicationSpecs, error: pubSpecsError } =
        useLiveSpecs_spec(
            `editorandlogs-${collectionNames?.join('-')}`,
            collectionNames
        );
    const { publication: publications, error: pubsError } = usePublications(
        !disableLogs ? lastPubId : null
    );

    const setSpecs = useEditorStore_setSpecs({ localScope: localZustandScope });

    const setId = useEditorStore_setId({ localScope: localZustandScope });

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
                    <LiveSpecEditor localZustandScope={localZustandScope} />
                </Grid>

                <Grid item xs={6}>
                    {pubsError && !disableLogs ? (
                        <AlertBox severity="warning" short>
                            <FormattedMessage id="detailsPanel.logs.notFound" />
                        </AlertBox>
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
