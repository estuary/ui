import type { EditableFieldProps } from 'src/components/tables/cells/types';

import { useMemo } from 'react';

import { Box, Stack, TableCell, Typography, useTheme } from '@mui/material';

import { TextSquare } from 'iconoir-react';

import EditProjectionButton from 'src/components/projections/Edit/Button';
import { getStickyTableCell } from 'src/context/Theme';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const EditableField = ({
    field,
    fieldTextStyles,
    pointer,
    readOnly,
    sticky,
}: EditableFieldProps) => {
    const theme = useTheme();

    const currentCollection = useBinding_currentCollection();

    const projectedFields = useWorkflowStore((state) =>
        pointer && currentCollection && state.projections?.[currentCollection]
            ? Object.entries(state.projections[currentCollection])
                  .filter(([location, _metadata]) => location === pointer)
                  .flatMap(([_location, metadata]) => metadata)
            : []
    );

    const alternateField: string | undefined = useMemo(
        () =>
            projectedFields.length > 0
                ? projectedFields[projectedFields.length - 1].field
                : undefined,
        [projectedFields]
    );

    return (
        <TableCell sx={sticky ? getStickyTableCell() : undefined}>
            {field.length === 0 || readOnly ? (
                <Typography style={fieldTextStyles}>
                    {alternateField ?? field}
                </Typography>
            ) : (
                <Stack
                    direction="row"
                    spacing={1}
                    style={{ alignItems: 'center' }}
                >
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
                        field={alternateField ?? field}
                        fieldTextStyles={fieldTextStyles}
                        pointer={pointer}
                    />
                </Stack>
            )}
        </TableCell>
    );
};
