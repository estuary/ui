import Editor from '@monaco-editor/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    AlertTitle,
    Box,
    Grid,
    Typography,
    useTheme,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';

function ShardErrors() {
    const theme = useTheme();

    // const getShardDetails = useShardDetail_getShardDetails();

    return (
        <Grid item xs={12}>
            <Alert
                severity="error"
                sx={{
                    'mb': 1,
                    '& .MuiAlert-message': {
                        width: '100%',
                    },
                }}
            >
                <AlertTitle>
                    <Typography>
                        <FormattedMessage id="detailsPanel.shardDetails.errorTitle" />
                    </Typography>
                </AlertTitle>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            capture/estuary/actively/verkada_leads/source-s3/00000000-00000000
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box sx={{ height: 250 }}>
                            <Editor
                                defaultLanguage=""
                                theme={
                                    theme.palette.mode === 'light'
                                        ? 'vs'
                                        : 'vs-dark'
                                }
                                options={{
                                    lineNumbers: 'off',
                                    readOnly: true,
                                    scrollBeyondLastLine: false,
                                    minimap: {
                                        enabled: false,
                                    },
                                }}
                                value={`runTransactions: readMessage: connector failed (exit status: 1) with stderr:
                                connecting to store: unable to list objects in bucket "s3://actively-verkada/leads/": InvalidBucketName: The specified bucket is not valid.
                                    status code: 400, request id: NPDWWJ7XJKX5ZR60, host id: +TQOddezGdMilkXmnez7vfnIc66vny/o9EQHBfsWaUg5NAYJSJ6s5tCw6SB+aJeJUZHiNIS5Tls=
                                Error: go.estuary.dev/E002: Failed to execute command: airbyte-to-flow: failed with code 1.
                                `}
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            capture/estuary/actively/verkada_leads/source-s3/00000000-00000000
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box sx={{ height: 250 }}>
                            <Editor
                                defaultLanguage=""
                                theme={
                                    theme.palette.mode === 'light'
                                        ? 'vs'
                                        : 'vs-dark'
                                }
                                options={{
                                    lineNumbers: 'off',
                                    readOnly: true,
                                    scrollBeyondLastLine: false,
                                    minimap: {
                                        enabled: false,
                                    },
                                }}
                                value={`runTransactions: readMessage: connector failed (exit status: 1) with stderr:
                                connecting to store: unable to list objects in bucket "s3://actively-verkada/leads/": InvalidBucketName: The specified bucket is not valid.
                                    status code: 400, request id: NPDWWJ7XJKX5ZR60, host id: +TQOddezGdMilkXmnez7vfnIc66vny/o9EQHBfsWaUg5NAYJSJ6s5tCw6SB+aJeJUZHiNIS5Tls=
                                Error: go.estuary.dev/E002: Failed to execute command: airbyte-to-flow: failed with code 1.
                                `}
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            capture/estuary/actively/verkada_leads/source-s3/00000000-00000000
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box sx={{ height: 250 }}>
                            <Editor
                                defaultLanguage=""
                                theme={
                                    theme.palette.mode === 'light'
                                        ? 'vs'
                                        : 'vs-dark'
                                }
                                options={{
                                    lineNumbers: 'off',
                                    readOnly: true,
                                    scrollBeyondLastLine: false,
                                    minimap: {
                                        enabled: false,
                                    },
                                }}
                                value={`runTransactions: readMessage: connector failed (exit status: 1) with stderr:
                                connecting to store: unable to list objects in bucket "s3://actively-verkada/leads/": InvalidBucketName: The specified bucket is not valid.
                                    status code: 400, request id: NPDWWJ7XJKX5ZR60, host id: +TQOddezGdMilkXmnez7vfnIc66vny/o9EQHBfsWaUg5NAYJSJ6s5tCw6SB+aJeJUZHiNIS5Tls=
                                Error: go.estuary.dev/E002: Failed to execute command: airbyte-to-flow: failed with code 1.
                                `}
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            capture/estuary/actively/verkada_leads/source-s3/00000000-00000000
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box sx={{ height: 250 }}>
                            <Editor
                                defaultLanguage=""
                                theme={
                                    theme.palette.mode === 'light'
                                        ? 'vs'
                                        : 'vs-dark'
                                }
                                options={{
                                    lineNumbers: 'off',
                                    readOnly: true,
                                    scrollBeyondLastLine: false,
                                    minimap: {
                                        enabled: false,
                                    },
                                }}
                                value={`runTransactions: readMessage: connector failed (exit status: 1) with stderr:
                                connecting to store: unable to list objects in bucket "s3://actively-verkada/leads/": InvalidBucketName: The specified bucket is not valid.
                                    status code: 400, request id: NPDWWJ7XJKX5ZR60, host id: +TQOddezGdMilkXmnez7vfnIc66vny/o9EQHBfsWaUg5NAYJSJ6s5tCw6SB+aJeJUZHiNIS5Tls=
                                Error: go.estuary.dev/E002: Failed to execute command: airbyte-to-flow: failed with code 1.
                                `}
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Alert>
        </Grid>
    );

    // return getShardDetails(shards).filter(
    //     ({ errors }: ShardDetails) => !!errors
    // ).length > 0 ? (
    //     <Grid item xs={12}>
    //         <Alert
    //             severity="error"
    //             sx={{
    //                 'mb': 1,
    //                 '& .MuiAlert-message': {
    //                     width: '100%',
    //                 },
    //             }}
    //         >
    //             <AlertTitle>
    //                 <Typography>
    //                     <FormattedMessage id="detailsPanel.shardDetails.errorTitle" />
    //                 </Typography>
    //             </AlertTitle>

    //             {getShardDetails(shards).map(
    //                 (shardDetails: ShardDetails) =>
    //                     shardDetails.id &&
    //                     shardDetails.errors && (
    //                         <Accordion key={shardDetails.id}>
    //                             <AccordionSummary
    //                                 expandIcon={<ExpandMoreIcon />}
    //                             >
    //                                 <Typography>{shardDetails.id}</Typography>
    //                             </AccordionSummary>

    //                             <AccordionDetails>
    //                                 <Box sx={{ height: 250 }}>
    //                                     <Editor
    //                                         defaultLanguage=""
    //                                         theme={
    //                                             theme.palette.mode === 'light'
    //                                                 ? 'vs'
    //                                                 : 'vs-dark'
    //                                         }
    //                                         options={{
    //                                             lineNumbers: 'off',
    //                                             readOnly: true,
    //                                             scrollBeyondLastLine: false,
    //                                             minimap: {
    //                                                 enabled: false,
    //                                             },
    //                                         }}
    //                                         value={unescapeString(
    //                                             shardDetails.errors
    //                                                 .join(NEW_LINE)
    //                                                 .split(/\\n/)
    //                                                 .join(NEW_LINE)
    //                                         )}
    //                                     />
    //                                 </Box>
    //                             </AccordionDetails>
    //                         </Accordion>
    //                     )
    //             )}
    //         </Alert>
    //     </Grid>
    // ) : null;
}

export default ShardErrors;
