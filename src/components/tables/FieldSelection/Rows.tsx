import { TableCell, TableRow, Typography } from '@mui/material';
import { CompositeProjection } from 'src/components/editor/Bindings/FieldSelection/types';
import ChipListCell from 'src/components/tables/cells/ChipList';
import ConstraintDetails from 'src/components/tables/cells/fieldSelection/ConstraintDetails';
import FieldActions from 'src/components/tables/cells/fieldSelection/FieldActions';
import {
    doubleElevationHoverBackground,
    getStickyTableCell,
} from 'src/context/Theme';
import { orderBy } from 'lodash';
import { useBinding_currentBindingUUID } from 'src/stores/Binding/hooks';
import { basicSort_string } from 'src/utils/misc-utils';
import {
    constraintTypeSort,
    displayOptionalColumn,
    optionalColumnIntlKeys,
} from './shared';
import { RowProps, RowsProps } from './types';

function Row({ columns, row }: RowProps) {
    const currentBindingUUID = useBinding_currentBindingUUID();

    const pointerColumnDisplayed = displayOptionalColumn(
        columns,
        optionalColumnIntlKeys.pointer
    );

    const detailsColumnDisplayed = displayOptionalColumn(
        columns,
        optionalColumnIntlKeys.details
    );

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

            {pointerColumnDisplayed ? (
                <TableCell>
                    <Typography>{row.ptr}</Typography>
                </TableCell>
            ) : null}

            {row.inference?.types ? (
                <ChipListCell values={row.inference.types} stripPath={false} />
            ) : (
                <TableCell />
            )}

            {detailsColumnDisplayed ? (
                row.constraint ? (
                    <ConstraintDetails constraint={row.constraint} />
                ) : (
                    <TableCell />
                )
            ) : null}

            {currentBindingUUID && row.constraint ? (
                <FieldActions
                    bindingUUID={currentBindingUUID}
                    field={row.field}
                    constraint={row.constraint}
                    selectionType={row.selectionType}
                />
            ) : (
                <TableCell />
            )}
        </TableRow>
    );
}

// TODO (field selection): Share the custom sorting logic taken from src/components/tables/Schema/Rows.tsx.
//   At this point, the majority of the logic for these two components is shared. Consider unifying them.
function Rows({ columnToSort, columns, data, sortDirection }: RowsProps) {
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
                            columns={columns}
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
                            columns={columns}
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
                        columns={columns}
                        key={`field-selection-table-rows-${index}`}
                        row={projection}
                    />
                )
            )}
        </>
    );
}

export default Rows;
