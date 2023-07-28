import { TableCell, TableRow, Typography } from '@mui/material';
import { CompositeProjection } from 'components/editor/Bindings/FieldSelection/types';
import ChipListCell from 'components/tables/cells/ChipList';
import ConstraintDetails from 'components/tables/cells/fieldSelection/ConstraintDetails';
import FieldActions from 'components/tables/cells/fieldSelection/FieldActions';
import { orderBy } from 'lodash';
import { SortDirection } from 'types';

interface RowProps {
    row: CompositeProjection;
}

interface RowsProps {
    data: CompositeProjection[];
    sortDirection: SortDirection;
    columnToSort: string;
}

function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TableCell>
                <Typography>{row.field}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.ptr}</Typography>
            </TableCell>

            <ChipListCell values={row.inference.types} stripPath={false} />

            {row.constraint ? (
                <ConstraintDetails constraint={row.constraint} />
            ) : null}

            {row.constraint ? (
                <FieldActions
                    field={row.field}
                    constraint={row.constraint}
                    selectionType={row.selectionType}
                />
            ) : null}
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
                        ) => {
                            // Fetch the field
                            const a = first.field;
                            const b = second.field;

                            // See if the values start with alphanumeric
                            const aIsAlphabetical = a.localeCompare('a') >= 0;
                            const bIsAlphabetical = b.localeCompare('a') >= 0;

                            // If a is alpha and b isn't then return >0 to put b first
                            if (!aIsAlphabetical && bIsAlphabetical) {
                                return 1;
                            }

                            // If a is alpha and b isn't then return <0 to put a first
                            if (aIsAlphabetical && !bIsAlphabetical) {
                                return -1;
                            }

                            // If we're here we know both strings are alphanumeric and can do normal sorts
                            // ascending means compare a to b
                            if (sortDirection === 'asc') {
                                return a.localeCompare(b);
                            }

                            // descending means to flip the comparison order
                            return b.localeCompare(a);
                        }
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
