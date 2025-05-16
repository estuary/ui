import type { FieldListProps } from 'src/components/tables/cells/types';

import { Box, TableCell } from '@mui/material';

import EditProjectionButton from 'src/components/projections/Edit/Button';
import { ProjectionList } from 'src/components/projections/Edit/ProjectionList';
import { OutlinedChip } from 'src/components/shared/OutlinedChip';
import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useProjectedFields } from 'src/hooks/projections/useProjectedFields';

export const FieldList = ({
    deletable,
    diminishedText,
    field,
    pointer,
}: FieldListProps) => {
    const { collection } = useCollectionIndex();
    const { projectedFields } = useProjectedFields(collection, pointer);

    return (
        <TableCell>
            <Box
                style={{
                    alignItems: 'center',
                    display: 'inline-flex',
                    marginBottom: 8,
                }}
            >
                <EditProjectionButton field={field} pointer={pointer} />
            </Box>

            <ProjectionList
                collection={collection}
                deletable={deletable}
                diminishedText={diminishedText}
                projectedFields={projectedFields.reverse()}
            />

            <Box
                style={{
                    alignItems: 'center',
                    display: 'inline-flex',
                    marginTop: projectedFields.length > 0 ? 8 : undefined,
                }}
            >
                <OutlinedChip
                    diminishedText={projectedFields.length > 0}
                    label={field}
                    size="small"
                    variant="outlined"
                />
            </Box>
        </TableCell>
    );
};
