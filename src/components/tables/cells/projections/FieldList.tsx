import type { FieldListProps } from 'src/components/tables/cells/types';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';

import { TableCell } from '@mui/material';

import { ProjectionList } from 'src/components/projections/Edit/ProjectionList';
import { getStickyTableCell } from 'src/context/Theme';
import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useProjectedFields } from 'src/hooks/projections/useProjectedFields';

export const FieldList = ({
    editable,
    field,
    pointer,
    sticky,
}: FieldListProps) => {
    const { collection } = useCollectionIndex();
    const { projectedFields } = useProjectedFields(collection, pointer);

    const systemDefinedProjection: ProjectionMetadata[] = pointer
        ? [{ field: field, location: pointer, systemDefined: true }]
        : [];

    return (
        <TableCell sx={sticky ? getStickyTableCell() : undefined}>
            <ProjectionList
                collection={collection}
                editable={editable}
                maxChips={1}
                projectedFields={projectedFields
                    .reverse()
                    .concat(systemDefinedProjection)}
            />
        </TableCell>
    );
};
