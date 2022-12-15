import { TableCell } from '@mui/material';
import DateFilter from 'components/tables/Filters/Date';
import { SelectTableStoreNames } from 'stores/names';

interface Props {
    header: string;
    selectableTableStoreName: SelectTableStoreNames;
}

const StatsHeader = ({ selectableTableStoreName }: Props) => (
    <TableCell colSpan={2}>
        {' '}
        <DateFilter
            disabled={false}
            selectableTableStoreName={selectableTableStoreName}
        />
    </TableCell>
);

export default StatsHeader;
