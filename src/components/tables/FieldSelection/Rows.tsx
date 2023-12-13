import { TableCell, TableRow, Typography } from '@mui/material';
import { CompositeProjection } from 'components/editor/Bindings/FieldSelection/types';
import ChipListCell from 'components/tables/cells/ChipList';
import ConstraintDetails from 'components/tables/cells/fieldSelection/ConstraintDetails';
import FieldActions from 'components/tables/cells/fieldSelection/FieldActions';
import {
    doubleElevationHoverBackground,
    getStickyTableCell,
} from 'context/Theme';
import { orderBy } from 'lodash';
import { SortDirection } from 'types';
import { basicSort_string } from 'utils/misc-utils';

interface RowProps {
    row: CompositeProjection;
}

interface RowsProps {
    data: CompositeProjection[];
    sortDirection: SortDirection;
    columnToSort: string;
}

const constraintTypeSort_ascending = (
    a: CompositeProjection,
    b: CompositeProjection
): number => {
    // If a and b have constraint types but they are not equal, compare their severity.
    // The projection with the greater severity should appear first.
    if (
        a.constraint &&
        b.constraint &&
        a.constraint.type !== b.constraint.type
    ) {
        return a.constraint.type - b.constraint.type;
    }

    // If a and b do not have defined constraint types or their constraint types are equal,
    // perform an ascending, alphabetic sort on their fields.
    return a.field.localeCompare(b.field);
};

const constraintTypeSort_descending = (
    a: CompositeProjection,
    b: CompositeProjection
): number => {
    // If a and b have constraint types but they are not equal, compare their severity.
    // The projection with the greater severity should appear first.
    if (
        a.constraint &&
        b.constraint &&
        a.constraint.type !== b.constraint.type
    ) {
        return b.constraint.type - a.constraint.type;
    }

    // If a and b do not have defined constraint types or their constraint types are equal,
    // perform an descending, alphabetic sort on their fields.
    return b.field.localeCompare(a.field);
};

const constraintTypeSort = (
    a: CompositeProjection,
    b: CompositeProjection,
    sortDirection: SortDirection
) => {
    // See if the values start with alphanumeric
    const aIsAlphabetical = a.field.localeCompare('a') >= 0;
    const bIsAlphabetical = b.field.localeCompare('a') >= 0;

    // If a is not alpha and b is then return >0 to put b first
    if (!aIsAlphabetical && bIsAlphabetical) {
        return 1;
    }

    // If a is alpha and b isn't then return <0 to put a first
    if (aIsAlphabetical && !bIsAlphabetical) {
        return -1;
    }

    // If a does not have a constraint type and b does then return >0 to put b first
    if (!a.constraint && b.constraint) {
        return 1;
    }

    // If a has a constraint type and b does not then return <0 to put a first
    if (a.constraint && !b.constraint) {
        return -1;
    }

    return sortDirection === 'asc'
        ? constraintTypeSort_ascending(a, b)
        : constraintTypeSort_descending(a, b);
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
