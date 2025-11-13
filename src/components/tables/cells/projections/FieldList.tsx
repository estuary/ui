import type { FieldListProps } from 'src/components/tables/cells/types';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';

import { TableCell } from '@mui/material';

import { ProjectionList } from 'src/components/projections/Edit/ProjectionList';
import { getStickyTableCell } from 'src/context/Theme';
import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useProjectedFields } from 'src/hooks/projections/useProjectedFields';

export const FieldList = ({
    cannotExist,
    editable,
    field,
    pointer,
    sticky,
}: FieldListProps) => {
    const { collection } = useCollectionIndex();
    const { projectedFields } = useProjectedFields(collection, pointer);

    // If a user edits the schema in a way that makes a projection
    //  no longer valid. We want to check this so that we do not show
    //  the same projection twice in the list.
    const fieldExistsInProjected = projectedFields.some(
        (projection) => projection.field === field
    );

    const systemDefinedProjection: ProjectionMetadata[] =
        pointer && !fieldExistsInProjected
            ? [{ field: field, location: pointer, systemDefined: true }]
            : [];

    return (
        <TableCell sx={sticky ? getStickyTableCell() : undefined}>
            <ProjectionList
                cannotExist={cannotExist}
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
