import type { FieldListProps } from 'src/components/tables/cells/types';

import { Box, TableCell } from '@mui/material';

import EditProjectionButton from 'src/components/projections/Edit/Button';
import { ProjectionList } from 'src/components/projections/Edit/ProjectionList';
import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useProjectedFields } from 'src/hooks/projections/useProjectedFields';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

export const FieldList = ({
    deletable,
    diminishedText,
    editable,
    field,
    pointer,
}: FieldListProps) => {
    const { collection } = useCollectionIndex();
    const { projectedFields } = useProjectedFields(collection, pointer);

    return (
        <TableCell>
            {editable ? (
                <Box
                    style={{
                        alignItems: 'center',
                        display: 'inline-flex',
                        marginBottom: 8,
                    }}
                >
                    <EditProjectionButton field={field} pointer={pointer} />
                </Box>
            ) : null}

            <ProjectionList
                collection={collection}
                deletable={deletable}
                diminishedText={diminishedText}
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
