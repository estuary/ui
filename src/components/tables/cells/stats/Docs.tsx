import { TableCell } from '@mui/material';
import { tableBorderSx } from 'context/Theme';
import { FormattedNumber } from 'react-intl';

interface Props {
    val?: number;
}

const Docs = ({ val }: Props) => {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                maxWidth: 'min-content',
            }}
        >
            <FormattedNumber value={val ?? 0} />
        </TableCell>
    );
};

export default Docs;
