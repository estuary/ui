import { TableCell, TableRow, useTheme } from '@mui/material';
import { BaseDataPlaneQuery } from 'api/dataPlanes';
import SingleLineCode from 'components/content/SingleLineCode';
import { getEntityTableRowSx } from 'context/Theme';
import {
    formatDataPlaneName,
    formatDataPlaneOption,
} from 'utils/dataPlane-utils';
import ChipListCell from '../cells/ChipList';

interface RowsProps {
    data: BaseDataPlaneQuery[];
}

interface RowProps {
    row: BaseDataPlaneQuery;
}

function Row({ row }: RowProps) {
    const theme = useTheme();

    const dataPlaneOption = formatDataPlaneOption(row);

    console.log('row', row);

    return (
        <TableRow hover sx={getEntityTableRowSx(theme)}>
            <TableCell>{dataPlaneOption.scope}</TableCell>
            <TableCell>
                {formatDataPlaneName(dataPlaneOption.dataPlaneName)}
            </TableCell>
            <TableCell>
                <SingleLineCode value={dataPlaneOption.reactorAddress} />
            </TableCell>

            {/*            <TableCell>
                <SingleLineCode value={(row.ssh_subnets ?? []).join(', ')} />
            </TableCell>*/}

            <ChipListCell
                values={row.ssh_subnets ?? []}
                stripPath={false}
                maxChips={5}
            />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row key={row.id} row={row} />
            ))}
        </>
    );
}

export default Rows;
