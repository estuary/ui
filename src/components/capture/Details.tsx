import Editor from '@monaco-editor/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Grid,
    Typography,
    useTheme,
} from '@mui/material';
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
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ShardDetails, shardDetailSelectors } from 'stores/ShardDetail';
import { ENTITY } from 'types';

interface Props {
    lastPubId: string;
    disableLogs?: boolean;
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

const NEW_LINE = '\r\n';

function CaptureDetails({ lastPubId, disableLogs, entityType }: Props) {
    useBrowserTitle('browserTitle.captureDetails');
    const theme = useTheme();

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const [shardDetails, setShardDetails] = useState<ShardDetails | null>(null);

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

    useEffect(() => {
        if (specs && specs.length > 0) {
            setShardDetails(
                getShardDetails(
                    specs.find(({ spec_type }) => spec_type === entityType)
                        ?.catalog_name
                )
            );
        }
    }, [specs, getShardDetails, setShardDetails, entityType]);

    const handlers = {
        mount: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
            editorRef.current = editor;
        },
    };

    if (pubSpecsError) {
        return <Error error={pubSpecsError} />;
    } else {
        return (
            <Grid container spacing={2}>
                {shardDetails && (
                    <>
                        {shardDetails.errors && (
                            <Grid item xs={12}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        '& .MuiAlert-message': {
                                            width: '100%',
                                        },
                                    }}
                                >
                                    <Accordion>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <Typography>
                                                <FormattedMessage id="captureDetails.shardDetails.errorTitle" />
                                            </Typography>
                                        </AccordionSummary>

                                        <AccordionDetails>
                                            <Box sx={{ height: 250 }}>
                                                <Editor
                                                    defaultLanguage=""
                                                    theme={
                                                        theme.palette.mode ===
                                                        'light'
                                                            ? 'vs'
                                                            : 'vs-dark'
                                                    }
                                                    options={{
                                                        lineNumbers: 'off',
                                                        readOnly: true,
                                                        scrollBeyondLastLine:
                                                            false,
                                                        minimap: {
                                                            enabled: false,
                                                        },
                                                    }}
                                                    onMount={handlers.mount}
                                                    value={shardDetails.errors
                                                        .join(NEW_LINE)
                                                        .split(/\\n/)
                                                        .join(NEW_LINE)
                                                        .replaceAll(
                                                            /\\"/g,
                                                            '"'
                                                        )}
                                                />
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                </Alert>
                            </Grid>
                        )}

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
