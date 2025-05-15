import type { AliasListProps } from 'src/components/tables/cells/types';

import { Box, Stack, TableCell } from '@mui/material';

import EditProjectionButton from 'src/components/projections/Edit/Button';
import { ProjectionList } from 'src/components/projections/Edit/ProjectionList';
import { OutlinedChip } from 'src/components/shared/OutlinedChip';
import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useProjectedFields } from 'src/hooks/projections/useProjectedFields';

export const FieldList = ({ field, pointer }: AliasListProps) => {
    const { collection } = useCollectionIndex();
    const { projectedFields } = useProjectedFields(collection, pointer);

    return (
        <TableCell>
            <Stack spacing={1}>
                <Box style={{ alignItems: 'center', display: 'inline-flex' }}>
                    <EditProjectionButton field={field} pointer={pointer} />
                </Box>

                <ProjectionList
                    collection={collection}
                    projectedFields={projectedFields.reverse()}
                />

                <Box style={{ alignItems: 'center', display: 'inline-flex' }}>
                    <OutlinedChip
                        diminishedText={projectedFields.length > 0}
                        label={field}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </Stack>
        </TableCell>
    );
};
