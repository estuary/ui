import { TableCell, TableRow, Typography } from '@mui/material';
import { CompositeProjection } from 'components/editor/Bindings/FieldSelection/types';
import ChipListCell from 'components/tables/cells/ChipList';
import Actions from 'components/tables/cells/fieldSelection/Actions';
import ConstraintDetails from 'components/tables/cells/fieldSelection/ConstraintDetails';

interface RowProps {
    row: CompositeProjection;
}

interface RowsProps {
    data: CompositeProjection[];
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

            {row.constraint ? <Actions constraint={row.constraint} /> : null}
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((projection, index) => (
                <Row
                    key={`field-selection-table-rows-${index}`}
                    row={projection}
                />
            ))}
        </>
    );
}

export default Rows;
