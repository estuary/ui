import { TableCell } from '@mui/material';
import { tableBorderSx } from 'context/Theme';
import prettyBytes from 'pretty-bytes';

interface Props {
    val: number;
}

const Bytes = ({ val }: Props) => {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                maxWidth: 'min-content',
            }}
        >
            {prettyBytes(val, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </TableCell>
    );
};

export default Bytes;
