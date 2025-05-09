import type { EditableFieldProps } from 'src/components/tables/cells/fieldSelection/types';

import { Box, Stack, TableCell, Typography, useTheme } from '@mui/material';

import { TextSquare } from 'iconoir-react';

import EditProjectionButton from 'src/components/editor/Bindings/FieldSelection/EditProjection/Button';
import { getStickyTableCell } from 'src/context/Theme';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const EditableField = ({
    buttonStyles,
    field,
    pointer,
    readOnly,
    sticky,
}: EditableFieldProps) => {
    const theme = useTheme();

    const currentCollection = useBinding_currentCollection();

    const alternateField = useWorkflowStore((state) =>
        pointer && currentCollection && state.projections?.[currentCollection]
            ? Object.entries(state.projections[currentCollection])
                  .filter(([location, _metadata]) => location === pointer)
                  .map(([_location, metadata]) => metadata.field)
                  .at(0)
            : undefined
    );

    if (field.length === 0 || readOnly) {
        return (
            <TableCell sx={sticky ? getStickyTableCell() : undefined}>
                <Typography>{alternateField ?? field}</Typography>
            </TableCell>
        );
    }

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
                    buttonStyles={buttonStyles}
                    field={alternateField ?? field}
                    pointer={pointer}
                />
            </Stack>
        </TableCell>
    );
};
