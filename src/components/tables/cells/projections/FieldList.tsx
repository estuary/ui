import type { FieldListProps } from 'src/components/tables/cells/types';

import { Box, TableCell } from '@mui/material';

import { ProjectionList } from 'src/components/projections/Edit/ProjectionList';
import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useProjectedFields } from 'src/hooks/projections/useProjectedFields';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

export const FieldList = ({
    diminishedText,
    editable,
    field,
    pointer,
}: FieldListProps) => {
    const { collection } = useCollectionIndex();
    const { projectedFields } = useProjectedFields(collection, pointer);

    return (
        <TableCell>
            <ProjectionList
                collection={collection}
                diminishedText={diminishedText}
                editable={editable}
                maxChips={1}
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
