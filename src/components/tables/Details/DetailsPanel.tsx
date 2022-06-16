import { Collapse, Grid, TableCell, TableRow } from '@mui/material';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import { LiveSpecEditorStoreNames, ZustandProvider } from 'context/Zustand';
import { ENTITY } from 'types';
import ShardInformation from 'components/tables/Details/ShardInformation';
import { tableBorderSx } from 'context/Theme';
import { createEditorStore } from 'components/editor/Store';

interface Props {
    detailsExpanded: boolean;
    id: string;
    colSpan: number;
    disableLogs?: boolean;
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

function DetailsPanel({
    detailsExpanded,
    id,
    colSpan,
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
                    <ZustandProvider
                        storeSlice={{
                            storeName: LiveSpecEditorStoreNames.GENERAL,
                            createStore: createEditorStore(
                                LiveSpecEditorStoreNames.GENERAL
                            ),
                        }}
                    >
                        <Grid container spacing={2}>
                            {entityType && (
                                <ShardInformation entityType={entityType} />
                            )}

                            <EditorAndLogs
                                lastPubId={id}
                                disableLogs={disableLogs}
                                liveSpecEditorStoreName={
                                    LiveSpecEditorStoreNames.GENERAL
                                }
                            />
                        </Grid>
                    </ZustandProvider>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
