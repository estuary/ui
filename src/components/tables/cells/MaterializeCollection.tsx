import { TableCell } from '@mui/material';

import MaterializeLink from 'src/components/shared/Entity/MaterializeLink';

interface Props {
    liveSpecId: string;
    name: string;
}

function MaterializeCollection({ liveSpecId, name }: Props) {
    return (
        <TableCell
            sx={{
                maxWidth: 'min-content',
                textAlign: 'right',
            }}
        >
            <MaterializeLink liveSpecId={liveSpecId} name={name} />
        </TableCell>
    );
}

export default MaterializeCollection;
