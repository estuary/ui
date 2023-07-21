import { NavArrowDown } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import Editor from '@monaco-editor/react';
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

import { useShardDetail_getShardDetails } from 'stores/ShardDetail/hooks';
import { ShardDetails } from 'stores/ShardDetail/types';

import { unescapeString } from 'utils/misc-utils';

import { Shard } from 'data-plane-gateway/types/shard_client';

interface Props {
    shards: Shard[] | null;
}

const NEW_LINE = '\r\n';

function ShardErrors({ shards }: Props) {
    const theme = useTheme();
    const getShardDetails = useShardDetail_getShardDetails();

    if (shards === null) {
        return null;
    }

    return getShardDetails(shards).filter(
        ({ errors }: ShardDetails) => !!errors
    ).length > 0 ? (
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

                {getShardDetails(shards).map(
                    (shardDetails: ShardDetails) =>
                        shardDetails.id &&
                        shardDetails.errors && (
                            <Accordion key={shardDetails.id} defaultExpanded>
                                <AccordionSummary
                                    expandIcon={
                                        <NavArrowDown
                                            style={{
                                                color: theme.palette.text
                                                    .primary,
                                            }}
                                        />
                                    }
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
                                            value={unescapeString(
                                                shardDetails.errors
                                                    .join(NEW_LINE)
                                                    .split(/\\n/)
                                                    .join(NEW_LINE)
                                            )}
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
