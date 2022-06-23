import { Collapse, Grid, TableCell, TableRow } from '@mui/material';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import { LiveSpecEditorStoreNames } from 'context/Zustand';
import { ENTITY } from 'types';
import ShardInformation from 'components/tables/Details/ShardInformation';
import { tableBorderSx } from 'context/Theme';
import { createEditorStore } from 'components/editor/Store';
import {
    LocalZustandProvider,
    useLocalZustandStore,
} from 'context/LocalZustand';

interface Props {
    detailsExpanded: boolean;
    lastPubId: string;
    colSpan: number;
    omittedSpecType?: ENTITY;
    liveSpecId?: string;
    disableLogs?: boolean;
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

function DetailsPanel({
    detailsExpanded,
    lastPubId,
    colSpan,
    omittedSpecType,
    liveSpecId,
    disableLogs,
    entityType,
}: Props) {
    return (
        <TableRow>
            <TableCell
                sx={
                    detailsExpanded
                        ? tableBorderSx
                        : { pb: 0, pt: 0, ...tableBorderSx }
                }
                colSpan={colSpan}
            >
                <Collapse in={detailsExpanded} unmountOnExit>
                    <LocalZustandProvider
                        createStore={createEditorStore(
                            LiveSpecEditorStoreNames.GENERAL
                        )}
                    >
                        <Grid container spacing={2}>
                            {entityType && (
                                <ShardInformation
                                    useZustandStore={useLocalZustandStore}
                                    entityType={entityType}
                                />
                            )}

                            <EditorAndLogs
                                lastPubId={lastPubId}
                                omittedSpecType={omittedSpecType}
                                liveSpecId={liveSpecId}
                                disableLogs={disableLogs}
                                liveSpecEditorStoreName={
                                    LiveSpecEditorStoreNames.GENERAL
                                }
                                useZustandStore={useLocalZustandStore}
                            />
                        </Grid>
                    </LocalZustandProvider>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
