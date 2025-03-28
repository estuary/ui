import { TableCell } from '@mui/material';
import RelatedCollections from 'src/components/shared/Entity/RelatedCollections';

interface Props {
    values: string[];
}

function RelatedCollectionsCell({ values }: Props) {
    return (
        <TableCell>
            <RelatedCollections collections={values} />
        </TableCell>
    );
}

export default RelatedCollectionsCell;
