import {
    Collapse,
    Divider,
    Grid,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { createEditorStore } from 'components/editor/Store';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import ShardInformation from 'components/tables/Details/ShardInformation';
import {
    LocalZustandProvider,
    useLocalZustandStore,
} from 'context/LocalZustand';
import { darkGlassBkgColorIntensified, tableBorderSx } from 'context/Theme';
import {
    LiveSpecEditorStoreNames,
    ShardDetailStoreNames,
} from 'context/Zustand';
import { concat } from 'lodash';
import { useMemo } from 'react';
import { ENTITY } from 'types';

interface Props {
    detailsExpanded: boolean;
    lastPubId: string;
    colSpan: number;
    entityType: ENTITY;
    entityName: string;
    collectionNames?: string[];
    disableLogs?: boolean; // TODO (detail logs) We'll start using this again when we have better logs
    shardDetailStoreName?: ShardDetailStoreNames;
}

function DetailsPanel({
    detailsExpanded,
    lastPubId,
    colSpan,
    entityType,
    shardDetailStoreName,
    collectionNames,
    entityName,
}: Props) {
    const fullList = useMemo(
        () => concat([entityName], collectionNames),
        [collectionNames, entityName]
    ) as string[];

    const isCollection = entityType === ENTITY.COLLECTION;

    return (
        <TableRow>
            <TableCell
                sx={{
                    pb: 0,
                    pt: 0,
                    ...tableBorderSx,
                }}
                colSpan={colSpan}
            >
                <Collapse
                    in={detailsExpanded}
                    sx={{
                        p: 2,
                        pb: 0,
                        mb: 2,
                        mt: 0,
                        bgcolor: darkGlassBkgColorIntensified,
                    }}
                    unmountOnExit
                >
                    <LocalZustandProvider
                        createStore={createEditorStore(
                            LiveSpecEditorStoreNames.GENERAL
                        )}
                    >
                        <Grid container spacing={2}>
                            {shardDetailStoreName && !isCollection ? (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1">
                                        Status
                                    </Typography>
                                    <ShardInformation
                                        useLocalZustandStore={
                                            useLocalZustandStore
                                        }
                                        entityType={entityType}
                                        shardDetailStoreName={
                                            shardDetailStoreName
                                        }
                                    />
                                </Grid>
                            ) : null}

                            <Grid item xs={12}>
                                <Typography variant="subtitle1">
                                    Specification
                                </Typography>
                                <EditorAndLogs
                                    collectionNames={fullList}
                                    lastPubId={lastPubId}
                                    disableLogs={true}
                                    liveSpecEditorStoreName={
                                        LiveSpecEditorStoreNames.GENERAL
                                    }
                                    useZustandStore={useLocalZustandStore}
                                />
                            </Grid>

                            <Divider />

                            {entityName && isCollection ? (
                                <Grid item xs={12}>
                                    <DataPreview collectionName={entityName} />
                                </Grid>
                            ) : null}
                        </Grid>
                    </LocalZustandProvider>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
