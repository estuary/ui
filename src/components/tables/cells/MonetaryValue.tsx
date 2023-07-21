import { useIntl } from 'react-intl';

import { TableCell, Typography } from '@mui/material';

interface Props {
    amount: number;
}

function MonetaryValue({ amount }: Props) {
    const intl = useIntl();

    return (
        <TableCell>
            <Typography>
                {intl.formatNumber(amount, {
                    style: 'currency',
                    currency: 'USD',
                })}
            </Typography>
        </TableCell>
    );
}

export default MonetaryValue;
