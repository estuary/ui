import { TableCell, TableRow } from '@mui/material';
import { LiveSpecsQuery } from 'components/tables/Captures';
import EntityName from 'components/tables/cells/EntityName';
import TimeStamp from 'components/tables/cells/TimeStamp';

interface Props {
    data: LiveSpecsQuery[];
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: 'spec_type',
        headerIntlKey: 'entityTable.data.connectorType',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
];

function Rows({ data }: Props) {
    return (
        <>
            {data.map((row) => (
                <TableRow key={`Entity-${row.id}`}>
                    <EntityName name={row.catalog_name} />

                    <TableCell sx={{ minWidth: 100 }}>
                        {row.spec_type}
                    </TableCell>

                    <TimeStamp time={row.updated_at} />
                </TableRow>
            ))}
        </>
    );
}

export default Rows;
