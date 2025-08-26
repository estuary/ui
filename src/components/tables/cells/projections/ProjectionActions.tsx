import type { ProjectionActionsProps } from 'src/components/tables/cells/types';

import { TableCell } from '@mui/material';

import EditProjectionButton from 'src/components/projections/Edit/Button';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

export const ProjectionActions = ({
    field,
    pointer,
}: ProjectionActionsProps) => {
    const formActive = useFormStateStore_isActive();

    return (
        <TableCell>
            <EditProjectionButton
                disabled={formActive}
                field={field}
                pointer={pointer}
            />
        </TableCell>
    );
};
