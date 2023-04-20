import {
    Box,
    Collapse,
    Divider,
    Grid,
    TableCell,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { createEditorStore } from 'components/editor/Store/create';
import { TaskEndpoints } from 'components/shared/TaskEndpoints';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import ShardInformation from 'components/tables/Details/ShardInformation';
import { LocalZustandProvider } from 'context/LocalZustand';
import { detailsPanelBgColor } from 'context/Theme';
import { concat } from 'lodash';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { EditorStoreNames } from 'stores/names';
import { Entity } from 'types';

interface Props {
    colSpan: number;
    detailsExpanded: boolean;
    entityName: string;
    entityType: Entity;
    lastPubId: string;
    collectionNames?: string[];
    disableLogs?: boolean; // TODO (detail logs) We'll start using this again when we have better logs
}

function DetailsPanel({
    detailsExpanded,
    lastPubId,
    colSpan,
    entityType,
    collectionNames,
    entityName,
}: Props) {
    const theme = useTheme();

    const fullList = useMemo(
        () => concat([entityName], collectionNames),
        [collectionNames, entityName]
    ) as string[];

    const isCollection = entityType === 'collection';

    const endpoints = useMemo(() => {
        if (entityType === 'capture' || entityType === 'materialization') {
            return (
                <Grid item xs={12} sx={{ mx: 2 }}>
                    <TaskEndpoints taskName={entityName} />
                    <Divider sx={{ mt: 4 }} />
                </Grid>
            );
        } else {
            return null;
        }
    }, [entityName, entityType]);

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
                            <Grid container spacing={2}>
                                <Grid item xs={12} sx={{ mx: 2 }}>
                                    <ShardInformation entityType={entityType} />
                                </Grid>

                                {endpoints}

                                <Grid item xs={12} sx={{ mx: 2 }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ mb: 2, fontWeight: 500 }}
                                    >
                                        <FormattedMessage id="detailsPanel.specification.header" />
                                    </Typography>

                                    <EditorAndLogs
                                        collectionNames={fullList}
                                        lastPubId={lastPubId}
                                        disableLogs={true}
                                        localZustandScope={true}
                                    />
                                </Grid>

                                {entityName && isCollection ? (
                                    <>
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <DataPreview
                                                collectionName={entityName}
                                            />
                                        </Grid>
                                    </>
                                ) : null}
                            </Grid>
                        </LocalZustandProvider>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
