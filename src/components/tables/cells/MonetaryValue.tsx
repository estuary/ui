import { TableCell, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

interface Props {
    amount: number;
}

function MonetaryValue({ amount }: Props) {
    const intl = useIntl();

    return (
        <TableCell align="right">
            <Typography>
                {intl.formatNumber(amount / 100, {
                    style: 'currency',
                    currency: 'USD',
                })}
            </Typography>
        </TableCell>
    );
}

export default MonetaryValue;
