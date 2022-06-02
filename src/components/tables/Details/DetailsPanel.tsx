import { Collapse, Grid, TableCell, TableRow } from '@mui/material';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import { createEditorStore } from 'components/editor/Store';
import { ZustandProvider } from 'hooks/useZustand';
import { ENTITY } from 'types';
import ShardDetails from 'components/tables/Details/ShardDetails';

interface Props {
    detailsExpanded: boolean;
    id: string;
    storeName?: string;
    colSpan: number;
    disableLogs?: boolean;
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

function DetailsPanel({
    detailsExpanded,
    id,
    storeName = 'liveSpecEditor',
    colSpan,
    disableLogs,
    entityType,
}: Props) {
    return (
        <TableRow>
            <TableCell
                sx={detailsExpanded ? null : { pb: 0, pt: 0 }}
                colSpan={colSpan}
            >
                <Collapse in={detailsExpanded} unmountOnExit>
                    <ZustandProvider
                        createStore={createEditorStore}
                        storeName={storeName}
                    >
                        <Grid container spacing={2}>
                            <ShardDetails entityType={entityType} />

                            <EditorAndLogs
                                lastPubId={id}
                                disableLogs={disableLogs}
                            />
                        </Grid>
                    </ZustandProvider>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
