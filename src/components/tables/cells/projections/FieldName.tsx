import type { FieldNameProps } from 'src/components/tables/cells/types';

import { useMemo } from 'react';

import { TableCell, Typography } from '@mui/material';

import { getStickyTableCell } from 'src/context/Theme';
import { useCollectionIndex } from 'src/hooks/projections/useCollectionIndex';
import { useProjectedFields } from 'src/hooks/projections/useProjectedFields';

export const FieldName = ({ existence, field, pointer }: FieldNameProps) => {
    const { collection } = useCollectionIndex();
    const { projectedFields } = useProjectedFields(collection, pointer);

    const alternateField: string | undefined = useMemo(
        () =>
            projectedFields.length > 0
                ? projectedFields.sort().at(0)?.field
                : undefined,
        [projectedFields]
    );

    return (
        <TableCell sx={getStickyTableCell()}>
            <Typography
                style={
                    existence === 'must'
                        ? { fontWeight: 700 }
                        : { fontStyle: 'italic' }
                }
            >
                {alternateField ?? field}
            </Typography>
        </TableCell>
    );
};
