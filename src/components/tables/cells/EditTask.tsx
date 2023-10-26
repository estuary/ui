import { TableCell } from '@mui/material';
import EditLink from 'components/shared/Entity/Shard/EditLink';

interface Props {
    liveSpecId: string;
    name: string;
}

function EditTask({ liveSpecId, name }: Props) {
    return (
        <TableCell align="right">
            <EditLink liveSpecId={liveSpecId} name={name} />
        </TableCell>
    );
}

export default EditTask;
