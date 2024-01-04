import { TableCell, TableRow, Typography } from '@mui/material';
import { CompositeProjection } from 'components/editor/Bindings/FieldSelection/types';
import ChipListCell from 'components/tables/cells/ChipList';
import FieldActions from 'components/tables/cells/fieldSelection/FieldActions';
import {
    doubleElevationHoverBackground,
    getStickyTableCell,
} from 'context/Theme';
import { orderBy } from 'lodash';
import { SortDirection } from 'types';
import {
    basicSort_string,
    compareInitialCharacterType,
} from 'utils/misc-utils';
import ConstraintDetails from '../cells/fieldSelection/ConstraintDetails';

interface RowProps {
    row: CompositeProjection;
}

interface RowsProps {
    data: CompositeProjection[];
    sortDirection: SortDirection;
    columnToSort: string;
}

const compareConstraintTypes = (
    a: CompositeProjection,
    b: CompositeProjection,
    ascendingSort: boolean
): number => {
    // If a and b have constraint types but they are not equal, compare their severity.
    // The projection with the greater severity should appear first.
    if (
        a.constraint &&
        b.constraint &&
        a.constraint.type !== b.constraint.type
    ) {
        return ascendingSort
            ? a.constraint.type - b.constraint.type
            : b.constraint.type - a.constraint.type;
    }

    // If a and b do not have defined constraint types or their constraint types are equal,
    // perform an ascending, alphabetic sort on their fields.
    return ascendingSort
        ? a.field.localeCompare(b.field)
        : b.field.localeCompare(a.field);
};

const constraintTypeSort = (
    a: CompositeProjection,
    b: CompositeProjection,
    sortDirection: SortDirection
) => {
    const sortResult = compareInitialCharacterType(a.field, b.field);

    if (typeof sortResult === 'number') {
        return sortResult;
    }

    // If a does not have a constraint type and b does then return >0 to put b first
    if (!a.constraint && b.constraint) {
        return 1;
    }

    // If a has a constraint type and b does not then return <0 to put a first
    if (a.constraint && !b.constraint) {
        return -1;
    }

    const ascendingSort = sortDirection === 'asc';

    return compareConstraintTypes(a, b, ascendingSort);
};

function Row({ row }: RowProps) {
    return (
        <TableRow
            sx={{
                '&:hover td': {
                    background: (theme) =>
                        doubleElevationHoverBackground[theme.palette.mode],
                },
            }}
        >
            <TableCell sx={getStickyTableCell()}>
                <Typography>{row.field}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.ptr}</Typography>
            </TableCell>

            {row.inference?.types ? (
                <ChipListCell values={row.inference.types} stripPath={false} />
            ) : (
                <TableCell />
            )}

            {row.constraint ? (
                <>
                    <ConstraintDetails constraint={row.constraint} />

                    <FieldActions
                        field={row.field}
                        constraint={row.constraint}
                        selectionType={row.selectionType}
                    />
                </>
            ) : (
                <>
                    <TableCell />

                    <TableCell />
                </>
            )}
        </TableRow>
    );
}

// TODO (field selection): Share the custom sorting logic taken from src/components/tables/Schema/Rows.tsx.
//   At this point, the majority of the logic for these two components is shared. Consider unifying them.
function Rows({ data, sortDirection, columnToSort }: RowsProps) {
    // We only do special sorting for field - otherwise we can use lodash
    //  We're probably safe always using the method below but made them
    //  different so we can have special control when sorting the fields
    //  in case we want to make more customizations
    if (columnToSort === 'field') {
        return (
            <>
                {data
                    .sort(
                        (
                            first: CompositeProjection,
                            second: CompositeProjection
                        ) =>
                            basicSort_string(
                                first.field,
                                second.field,
                                sortDirection
                            )
                    )
                    .map((record: CompositeProjection, index: number) => (
                        <Row
                            row={record}
                            key={`field-selection-table-rows-${index}`}
                        />
                    ))}
            </>
        );
    }

    if (columnToSort === 'constraint.type') {
        return (
            <>
                {data
                    .sort(
                        (
                            first: CompositeProjection,
                            second: CompositeProjection
                        ) => constraintTypeSort(first, second, sortDirection)
                    )
                    .map((record: CompositeProjection, index: number) => (
                        <Row
                            row={record}
                            key={`field-selection-table-rows-${index}`}
                        />
                    ))}
            </>
        );
    }

    // Use the orderBy lodash function when not sorting fields.
    return (
        <>
            {orderBy(data, [columnToSort], [sortDirection]).map(
                (projection, index) => (
                    <Row
                        key={`field-selection-table-rows-${index}`}
                        row={projection}
                    />
                )
            )}
        </>
    );
}

export default Rows;
