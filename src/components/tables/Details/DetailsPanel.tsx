import { Collapse, Grid, TableCell, TableRow } from '@mui/material';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import { CaptureStoreNames, MaterializationStoreNames } from 'hooks/useZustand';
import { ENTITY } from 'types';
import ShardInformation from 'components/tables/Details/ShardInformation';
import { tableBorderSx } from 'context/Theme';

interface Props {
    detailsExpanded: boolean;
    id: string;
    colSpan: number;
    disableLogs?: boolean;
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
    draftEditorStoreName?:
        | CaptureStoreNames.DRAFT_SPEC_EDITOR
        | MaterializationStoreNames.DRAFT_SPEC_EDITOR;
}

function DetailsPanel({
    detailsExpanded,
    id,
    colSpan,
    disableLogs,
    entityType,
    draftEditorStoreName = CaptureStoreNames.DRAFT_SPEC_EDITOR,
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
                    <Grid container spacing={2}>
                        {entityType && (
                            <ShardInformation entityType={entityType} />
                        )}

                        <EditorAndLogs
                            lastPubId={id}
                            disableLogs={disableLogs}
                            draftEditorStoreName={draftEditorStoreName}
                        />
                    </Grid>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
