import { TableCell, TableRow } from '@mui/material';
import { FormattedDate } from 'react-intl';

interface Props {
    discovers: any[];
    styling: any;
}

function Rows({ discovers, styling }: Props) {
    return (
        <>
            {discovers.map((row: any, index: number) => (
                <TableRow key={`Capture-${row.id}-${index}`}>
                    <TableCell style={styling}>{row.capture_name}</TableCell>
                    <TableCell style={styling}>{row.type}</TableCell>
                    <TableCell style={styling}>
                        <FormattedDate
                            day="numeric"
                            month="long"
                            year="numeric"
                            value={row.updated_at}
                        />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

export default Rows;
