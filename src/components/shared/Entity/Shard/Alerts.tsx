import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

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

import { NavArrowDown } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import ServerErrorDetail from 'src/components/shared/Alerts/ServerErrorDetails';
import { useShardDetail_readDictionary } from 'src/stores/ShardDetail/hooks';

interface Props {
    showWarnings?: boolean;
    taskTypes: ShardEntityTypes[];
    taskName: string;
}

function ShardAlerts({ showWarnings, taskName, taskTypes }: Props) {
    const theme = useTheme();
    const dictionaryVals = useShardDetail_readDictionary(taskName, taskTypes);

    if (!showWarnings && !dictionaryVals.shardsHaveErrors) {
        return null;
    }

    if (showWarnings && !dictionaryVals.shardsHaveWarnings) {
        return null;
    }

    return (
        <Grid size={{ xs: 12 }}>
            <Alert
                severity={showWarnings ? 'warning' : 'error'}
                sx={{
                    'mb': 1,
                    '& .MuiAlert-message': {
                        width: '100%',
                    },
                }}
            >
                <AlertTitle>
                    <Typography>
                        <FormattedMessage
                            id={
                                showWarnings
                                    ? 'detailsPanel.shardDetails.warningTitle'
                                    : 'detailsPanel.shardDetails.errorTitle'
                            }
                        />
                    </Typography>
                </AlertTitle>

                {dictionaryVals.allShards.map((shardDetails) => {
                    const listToUse =
                        shardDetails[showWarnings ? 'warnings' : 'errors'];
                    const listLength = listToUse?.length ?? 0;
                    if (shardDetails.id && listToUse && listLength > 0) {
                        return (
                            <Accordion
                                key={shardDetails.id}
                                // We only expand for errors. Otherwise the warnings are JUST for schema updating (Q2 2024)
                                defaultExpanded={!showWarnings} // TODO (shard errors) :  maybe check this to keep page smaller?{listLength === 1}
                            >
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
                                        <ServerErrorDetail val={listToUse} />
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        );
                    }

                    return null;
                })}
            </Alert>
        </Grid>
    );
}

export default ShardAlerts;
