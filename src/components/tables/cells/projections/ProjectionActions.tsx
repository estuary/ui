import type { ProjectionActionsProps } from 'src/components/tables/cells/types';

import { Stack, TableCell } from '@mui/material';

import EditProjectionButton from 'src/components/projections/Edit/Button';
import RedactFieldButton from 'src/components/projections/Redact/Button';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

export const ProjectionActions = ({
    field,
    pointer,
    redactionStrategy,
}: ProjectionActionsProps) => {
    const formActive = useFormStateStore_isActive();

    return (
        <TableCell>
            <Stack direction="row" spacing={1}>
                <EditProjectionButton
                    disabled={formActive}
                    field={field}
                    pointer={pointer}
                />

                {pointer ? (
                    <RedactFieldButton
                        disabled={formActive}
                        field={field}
                        pointer={pointer}
                        strategy={redactionStrategy}
                    />
                ) : null}
            </Stack>
        </TableCell>
    );
};
