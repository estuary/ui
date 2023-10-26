import { TableCell } from '@mui/material';
import MaterializeLink from 'components/shared/Entity/MaterializeLink';

interface Props {
    liveSpecId: string;
    name: string;
}

function MaterializeCollection({ liveSpecId, name }: Props) {
    return (
        <TableCell align="right">
            <MaterializeLink liveSpecId={liveSpecId} name={name} />
        </TableCell>
    );
}

export default MaterializeCollection;
