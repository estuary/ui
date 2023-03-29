import {
    Box,
    Collapse,
    Grid,
    Stack,
    TableCell,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { createEditorStore } from 'components/editor/Store/create';
import EditorHydrator from 'components/editor/Store/Hydrator';
import Overview from 'components/shared/Entity/Details/Overview';
import ShardHydrator from 'components/shared/Entity/Shard/Hydrator';
import { LocalZustandProvider } from 'context/LocalZustand';
import { detailsPanelBgColor } from 'context/Theme';
import { concat } from 'lodash';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { EditorStoreNames } from 'stores/names';
import { Entity } from 'types';
import EditorAndLogs from './EditorAndLogs';

interface Props {
    detailsExpanded: boolean;
    lastPubId: string;
    colSpan: number;
    entityType: Entity;
    entityName: string;
    collectionNames?: string[];
    disableLogs?: boolean; // TODO (detail logs) We'll start using this again when we have better logs
}

function DetailsPanel({
    detailsExpanded,
    lastPubId,
    colSpan,
    // entityType,
    collectionNames,
    entityName,
}: Props) {
    const theme = useTheme();

    const fullList = useMemo(
        () => concat([entityName], collectionNames),
        [collectionNames, entityName]
    ) as string[];

    return (
        <TableRow>
            <TableCell
                sx={{
                    pb: 0,
                    pt: 0,
                }}
                colSpan={colSpan}
            >
                <Collapse
                    in={detailsExpanded}
                    sx={{
                        pb: 0,
                        mb: 2,
                        mt: 0,
                        backgroundColor:
                            detailsPanelBgColor[theme.palette.mode],
                    }}
                    unmountOnExit
                >
                    <Box sx={{ margin: 2 }}>
                        <LocalZustandProvider
                            createStore={createEditorStore(
                                EditorStoreNames.GENERAL
                            )}
                        >
                            <EditorHydrator
                                collectionNames={[entityName]}
                                lastPubId={lastPubId}
                                localZustandScope={true}
                            >
                                <ShardHydrator
                                    lastPubId={lastPubId}
                                    catalogName={entityName}
                                >
                                    <Box>
                                        <Box sx={{ m: 1 }}>
                                            <Overview name={entityName} />
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Stack
                                                        direction="column"
                                                        spacing={2}
                                                        sx={{ m: 2 }}
                                                    >
                                                        <Typography
                                                            component="span"
                                                            variant="h6"
                                                            sx={{
                                                                alignItems:
                                                                    'center',
                                                            }}
                                                        >
                                                            <FormattedMessage id="detailsPanel.specification.header" />
                                                        </Typography>
                                                        <EditorAndLogs
                                                            collectionNames={
                                                                fullList
                                                            }
                                                            lastPubId={
                                                                lastPubId
                                                            }
                                                            disableLogs={true}
                                                            localZustandScope={
                                                                true
                                                            }
                                                        />
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Box>
                                </ShardHydrator>
                            </EditorHydrator>
                        </LocalZustandProvider>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
