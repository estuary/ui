import { TableCell, TableRow } from '@mui/material';
import { FormattedDate } from 'react-intl';

interface Props {
    data: any[];
}
const columnStyling = {
    maxWidth: '20%',
    textOverflow: 'ellipsis',
    width: '20%',
};

function Rows({ data }: Props) {
    return (
        <>
            {data.map((row: any) => (
                <TableRow key={`Connector-${row.id}`}>
                    <TableCell style={columnStyling}>
                        {row.connectors.image_name}
                        {row.image_tag}
                    </TableCell>
                    <TableCell style={columnStyling}>
                        {row.connectors.detail}
                    </TableCell>
                    <TableCell style={columnStyling}>{row.protocol}</TableCell>
                    <TableCell style={columnStyling}>
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
