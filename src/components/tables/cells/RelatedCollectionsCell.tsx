import { TableCell } from '@mui/material';

import RelatedEntities from 'src/components/shared/Entity/Details/RelatedEntities';

interface Props {
    values: string[];
}

function RelatedCollectionsCell({ values }: Props) {
    return (
        <TableCell>
            <RelatedEntities entities={values} entityType="collection" />
        </TableCell>
    );
}

export default RelatedCollectionsCell;
