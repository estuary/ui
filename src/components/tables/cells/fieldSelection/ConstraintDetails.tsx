import { FormattedMessage } from 'react-intl';

import { TableCell, Typography } from '@mui/material';

import {
    ConstraintTypes,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';

interface Props {
    constraint: TranslatedConstraint;
}

const getConstraintHeaderSettings = (
    constraintType: ConstraintTypes
): [string, 'success' | 'warning' | 'error'] => {
    switch (constraintType) {
        case ConstraintTypes.FIELD_REQUIRED:
            return ['fieldSelection.table.label.fieldRequired', 'success'];
        case ConstraintTypes.LOCATION_REQUIRED:
            return ['fieldSelection.table.label.locationRequired', 'success'];
        case ConstraintTypes.LOCATION_RECOMMENDED:
            return [
                'fieldSelection.table.label.locationRecommended',
                'warning',
            ];
        case ConstraintTypes.FIELD_OPTIONAL:
            return ['fieldSelection.table.label.fieldOptional', 'warning'];
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
                    color: (theme) => theme.palette[textColor].main,
                }}
            >
                <FormattedMessage id={messageId} />
            </Typography>

            <Typography>{constraint.reason}</Typography>
        </TableCell>
    );
}

export default ConstraintDetails;
