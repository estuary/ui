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
import { Shard } from 'data-plane-gateway/types/shard_client';
import { FormattedMessage } from 'react-intl';
import { getShardDetails } from 'utils/shard-utils';

interface Props {
    shards: Shard[];
}

const NEW_LINE = '\r\n';

function ShardErrors({ shards }: Props) {
    const theme = useTheme();

    return getShardDetails(shards).filter(({ errors }) => !!errors).length >
        0 ? (
        <Grid item xs={12}>
            <Alert
                severity="error"
                sx={{
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

                {getShardDetails(shards).map(
                    (shardErrors) =>
                        shardErrors.id &&
                        shardErrors.errors && (
                            <Accordion key={shardErrors.id}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                >
                                    <Typography>{shardErrors.id}</Typography>
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
                                            value={shardErrors.errors
                                                .join(NEW_LINE)
                                                .split(/\\n/)
                                                .join(NEW_LINE)
                                                .replaceAll(/\\"/g, '"')}
                                        />
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        )
                )}
            </Alert>
        </Grid>
    ) : null;
}

export default ShardErrors;
