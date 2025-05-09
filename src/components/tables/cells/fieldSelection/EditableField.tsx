import type { EditableFieldProps } from 'src/components/tables/cells/fieldSelection/types';

import { Box, Stack, TableCell, useTheme } from '@mui/material';

import { TextSquare } from 'iconoir-react';

import EditProjectionButton from 'src/components/editor/Bindings/FieldSelection/EditProjection/Button';
import { getStickyTableCell } from 'src/context/Theme';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const EditableField = ({ projection, sticky }: EditableFieldProps) => {
    const theme = useTheme();

    const currentCollection = useBinding_currentCollection();

    const alternateField = useWorkflowStore((state) =>
        projection.ptr &&
        currentCollection &&
        state.projections?.[currentCollection]
            ? Object.entries(state.projections[currentCollection])
                  .filter(
                      ([location, _metadata]) => location === projection.ptr
                  )
                  .map(([_location, metadata]) => metadata.field)
                  .at(0)
            : undefined
    );

    return (
        <TableCell sx={sticky ? getStickyTableCell() : undefined}>
            <Stack direction="row" spacing={1} style={{ alignItems: 'center' }}>
                {alternateField ? (
                    <TextSquare
                        style={{
                            color: theme.palette.text.primary,
                            fontSize: 10,
                        }}
                    />
                ) : (
                    <Box style={{ height: 15, width: 15 }} />
                )}

                <EditProjectionButton
                    field={alternateField ?? projection.field}
                    projection={projection}
                />
            </Stack>
        </TableCell>
    );
};
