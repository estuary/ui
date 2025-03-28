import { TableCell, Typography } from '@mui/material';

import { constraintMessages, recoverableConstraintTypes } from './shared';
import { ConstraintDetailsProps } from './types';
import { FormattedMessage } from 'react-intl';

function ConstraintDetails({ constraint }: ConstraintDetailsProps) {
    const messageId =
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        constraintMessages[constraint.type]?.id ??
        'fieldSelection.table.label.unknown';

    const textColor = recoverableConstraintTypes.includes(constraint.type)
        ? 'success'
        : 'error';

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
