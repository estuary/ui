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
import { Shard } from 'data-plane-gateway/types/shard_client';
import { NavArrowDown } from 'iconoir-react';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useShardDetail_getShardDetails } from 'stores/ShardDetail/hooks';
import { ShardDetails } from 'stores/ShardDetail/types';
import { unescapeString } from 'utils/misc-utils';

interface Props {
    shards: Shard[] | null;
}

const NEW_LINE = '\r\n';

function ShardErrors({ shards }: Props) {
    const theme = useTheme();
    const getShardDetails = useShardDetail_getShardDetails();

    const errors = useMemo(() => {
        if (shards === null) {
            return null;
        }

        return getShardDetails(shards).map((shardDetails: ShardDetails) => {
            console.log('shardDetails', shardDetails);
            if (shardDetails.id && shardDetails.errors) {
                return (
                    <Accordion key={shardDetails.id} defaultExpanded>
                        <AccordionSummary
                            expandIcon={
                                <NavArrowDown
                                    style={{
                                        color: theme.palette.text.primary,
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
                );
            }

            return null;
        });
    }, [
        getShardDetails,
        shards,
        theme.palette.mode,
        theme.palette.text.primary,
    ]);

    if (!errors) {
        return null;
    }

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

                {errors}
            </Alert>
        </Grid>
    );
}

export default ShardErrors;
