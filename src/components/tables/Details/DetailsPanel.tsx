import { Collapse, Grid, TableCell, TableRow } from '@mui/material';
import { createEditorStore } from 'components/editor/Store';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import ShardInformation from 'components/tables/Details/ShardInformation';
import {
    LocalZustandProvider,
    useLocalZustandStore,
} from 'context/LocalZustand';
import { tableBorderSx } from 'context/Theme';
import { LiveSpecEditorStoreNames } from 'context/Zustand';
import { ENTITY } from 'types';

interface Props {
    detailsExpanded: boolean;
    lastPubId: string;
    colSpan: number;
    specTypes?: ENTITY[];
    liveSpecId?: string;
    disableLogs?: boolean;
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

function DetailsPanel({
    detailsExpanded,
    lastPubId,
    colSpan,
    specTypes,
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
                            {entityType ? (
                                <ShardInformation
                                    useZustandStore={useLocalZustandStore}
                                    entityType={entityType}
                                />
                            ) : null}

                            <EditorAndLogs
                                lastPubId={lastPubId}
                                specTypes={specTypes}
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
