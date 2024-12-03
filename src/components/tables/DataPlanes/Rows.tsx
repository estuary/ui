import { TableCell, TableRow, useTheme } from '@mui/material';
import { BaseDataPlaneQuery } from 'api/dataPlanes';
import SingleLineCode from 'components/content/SingleLineCode';
import DataPlane from 'components/shared/Entity/DataPlane';
import { getEntityTableRowSx } from 'context/Theme';
import { useIntl } from 'react-intl';
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
    const intl = useIntl();
    const theme = useTheme();

    const dataPlaneOption = formatDataPlaneOption(row);

    return (
        <TableRow hover sx={getEntityTableRowSx(theme)}>
            <TableCell>
                {Boolean(dataPlaneOption.dataPlaneName) ? (
                    <DataPlane
                        dataPlaneName={dataPlaneOption.dataPlaneName}
                        formattedSuffix={formatDataPlaneName(
                            dataPlaneOption.dataPlaneName
                        )}
                        hidePrefix
                        logoSize={30}
                        scope={dataPlaneOption.scope}
                    />
                ) : null}
            </TableCell>
            <TableCell>
                <SingleLineCode value={dataPlaneOption.reactorAddress} />
            </TableCell>

            <TableCell>
                {row.cidr_blocks && row.cidr_blocks.length > 0 ? (
                    <SingleLineCode value={row.cidr_blocks.join(', ')} />
                ) : (
                    intl.formatMessage({
                        id: 'admin.dataPlanes.table.columns.ips.missing',
                    })
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
