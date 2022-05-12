import { Collapse, TableCell, TableRow } from '@mui/material';
import CaptureDetails from 'components/capture/Details';
import { createEditorStore } from 'components/editor/Store';
import { ZustandProvider } from 'hooks/useZustand';

interface Props {
    detailsExpanded: boolean;
    id: string;
    storeName?: string;
    colSpan: number;
}

function DetailsPanel({
    detailsExpanded,
    id,
    storeName = 'liveSpecEditor',
    colSpan,
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
                        <CaptureDetails lastPubId={id} />
                    </ZustandProvider>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
