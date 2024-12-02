import { TableCell, TableRow, useTheme } from '@mui/material';
import { BaseDataPlaneQuery } from 'api/dataPlanes';
import SingleLineCode from 'components/content/SingleLineCode';
import DataPlane from 'components/shared/Entity/DataPlane';
import { getEntityTableRowSx } from 'context/Theme';
import {
    formatDataPlaneName,
    formatDataPlaneOption,
} from 'utils/dataPlane-utils';

interface RowsProps {
    data: BaseDataPlaneQuery[];
}

interface RowProps {
    row: BaseDataPlaneQuery;
}

function Row({ row }: RowProps) {
    const theme = useTheme();

    const dataPlaneOption = formatDataPlaneOption(row);

    console.log('row', dataPlaneOption.dataPlaneName);

    return (
        <TableRow hover sx={getEntityTableRowSx(theme)}>
            <TableCell>{dataPlaneOption.scope}</TableCell>
            <TableCell>
                {Boolean(dataPlaneOption.dataPlaneName) ? (
                    <DataPlane
                        dataPlaneName={dataPlaneOption.dataPlaneName}
                        formattedSuffix={formatDataPlaneName(
                            dataPlaneOption.dataPlaneName
                        )}
                        logoSize={20}
                        scope={dataPlaneOption.scope}
                    />
                ) : null}
            </TableCell>
            <TableCell>
                <SingleLineCode value={dataPlaneOption.reactorAddress} />
            </TableCell>

            <TableCell>
                {row.ssh_subnets ? (
                    <SingleLineCode value={row.ssh_subnets.join(', ')} />
                ) : (
                    '-'
                )}
            </TableCell>
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