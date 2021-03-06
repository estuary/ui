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
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { ShardDetails, shardDetailSelectors } from 'stores/ShardDetail';

interface Props {
    shards: Shard[];
}

const NEW_LINE = '\r\n';

function ShardErrors({ shards }: Props) {
    const theme = useTheme();

    const useShardDetailStore = useRouteStore();
    const getShardDetails = useShardDetailStore(
        shardDetailSelectors.getShardDetails
    );

    return getShardDetails(shards).filter(
        ({ errors }: ShardDetails) => !!errors
    ).length > 0 ? (
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
                    (shardDetails: ShardDetails) =>
                        shardDetails.id &&
                        shardDetails.errors && (
                            <Accordion key={shardDetails.id}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                >
                                    <Typography>{shardDetails.id}</Typography>
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
                                            value={shardDetails.errors
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
