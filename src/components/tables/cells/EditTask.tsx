import { TableCell } from '@mui/material';
import EditLink from 'components/shared/Entity/EditLink';

interface Props {
    liveSpecId: string;
    name: string;
}

function EditTask({ liveSpecId, name }: Props) {
    return (
        <TableCell
            sx={{
                maxWidth: 'min-content',
                textAlign: 'right',
            }}
        >
            <EditLink liveSpecId={liveSpecId} name={name} />
        </TableCell>
    );
}

export default EditTask;
