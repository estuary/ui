import { Collapse, Grid, TableCell, TableRow } from '@mui/material';
import { CollectionPreview } from 'components/collection/DataPreview';
import { tableBorderSx } from 'context/Theme';

interface Props {
    expanded: boolean;
    colSpan: number;
    collectionName: string;
}

function PreviewPanel({ expanded, colSpan, collectionName }: Props) {
    return (
        <TableRow>
            <TableCell
                sx={{
                    ...(expanded
                        ? tableBorderSx
                        : { pb: 0, pt: 0, ...tableBorderSx }),
                    border: 0,
                }}
                colSpan={colSpan}
            >
                <Collapse in={expanded} unmountOnExit>
                    <Grid container spacing={2}>
                        <CollectionPreview collectionName={collectionName} />
                    </Grid>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default PreviewPanel;
