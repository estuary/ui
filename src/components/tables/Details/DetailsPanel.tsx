import { Collapse, Grid, TableCell, TableRow } from '@mui/material';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import { createEditorStore } from 'components/editor/Store';
import { ZustandProvider } from 'hooks/useZustand';
import { ENTITY } from 'types';
import ShardInformation from 'components/tables/Details/ShardInformation';

interface Props {
    detailsExpanded: boolean;
    id: string;
    storeName?: string;
    colSpan: number;
    browserTitleKey:
        | 'captureDetails'
        | 'materializationDetails'
        | 'collectionDetails';
    disableLogs?: boolean;
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

function DetailsPanel({
    detailsExpanded,
    id,
    storeName = 'liveSpecEditor',
    colSpan,
    browserTitleKey,
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
                            {entityType && (
                                <ShardInformation entityType={entityType} />
                            )}

                            <EditorAndLogs
                                lastPubId={id}
                                browserTitleKey={browserTitleKey}
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
