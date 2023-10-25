import { TableCell } from '@mui/material';
import EditLink from 'components/shared/Entity/Shard/EditLink';
import { useEntityType } from 'context/EntityContext';

interface Props {
    liveSpecId: string;
    name: string;
}

function EditTask({ liveSpecId, name }: Props) {
    const entityType = useEntityType();

    return (
        <TableCell>
            <EditLink
                liveSpecId={liveSpecId}
                name={name}
                pathPrefix={entityType}
            />
        </TableCell>
    );
}

export default EditTask;
