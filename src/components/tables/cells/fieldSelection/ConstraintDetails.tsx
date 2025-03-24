import { TableCell, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getConstraintHeaderSettings } from './shared';
import { ConstraintDetailsProps } from './types';

function ConstraintDetails({ constraint }: ConstraintDetailsProps) {
    const [messageId, textColor] = getConstraintHeaderSettings(constraint.type);

    return (
        <TableCell sx={{ minWidth: 275 }}>
            <Typography
                sx={{
                    fontWeight: 500,
                    color: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette[textColor].dark
                            : theme.palette[textColor].main,
                }}
            >
                <FormattedMessage id={messageId} />
            </Typography>

            <Typography>{constraint.reason}</Typography>
        </TableCell>
    );
}

export default ConstraintDetails;
