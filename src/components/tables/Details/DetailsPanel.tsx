import { Entity } from 'types';

import { useMemo } from 'react';

import { concat } from 'lodash';
import { FormattedMessage } from 'react-intl';

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

import { EditorStoreNames } from 'stores/names';

interface Props {
    detailsExpanded: boolean;
    lastPubId: string;
    colSpan: number;
    entityType: Entity;
    entityName: string;
    collectionNames?: string[];
    disableLogs?: boolean; // TODO (detail logs) We'll start using this again when we have better logs
}

// TODO (details) This is no longer used and needs removed soon. We now have
//  a dedicated details page. Leaving for right now in case we need the reference
//  to fix an issue or compare solutions. July, 2023
function DetailsPanel({
    detailsExpanded,
    lastPubId,
    colSpan,
    entityType,
    collectionNames,
    entityName,
}: Props) {
    const theme = useTheme();

    const localStore = useMemo(
        () => createEditorStore(EditorStoreNames.GENERAL),
        []
    );

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
                        <LocalZustandProvider createStore={localStore}>
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
