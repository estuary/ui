import { TableCell, Typography } from '@mui/material';
import {
    ConstraintTypes,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import { FormattedMessage } from 'react-intl';

interface Props {
    constraint: TranslatedConstraint;
}

const getConstraintHeaderSettings = (
    constraintType: ConstraintTypes
): [string, 'success' | 'error'] => {
    switch (constraintType) {
        case ConstraintTypes.FIELD_REQUIRED:
            return ['fieldSelection.table.label.fieldRequired', 'success'];
        case ConstraintTypes.LOCATION_REQUIRED:
            return ['fieldSelection.table.label.locationRequired', 'success'];
        case ConstraintTypes.LOCATION_RECOMMENDED:
            return [
                'fieldSelection.table.label.locationRecommended',
                'success',
            ];
        case ConstraintTypes.FIELD_OPTIONAL:
            return ['fieldSelection.table.label.fieldOptional', 'success'];
        case ConstraintTypes.FIELD_FORBIDDEN:
            return ['fieldSelection.table.label.fieldForbidden', 'error'];
        case ConstraintTypes.UNSATISFIABLE:
            return ['fieldSelection.table.label.unsatisfiable', 'error'];
        default:
            return ['fieldSelection.table.label.unknown', 'error'];
    }
};

function ConstraintDetails({ constraint }: Props) {
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
