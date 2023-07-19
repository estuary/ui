import { TableCell, Typography } from '@mui/material';
import {
    ConstraintTypes,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import { FormattedMessage } from 'react-intl';

interface Props {
    constraint: TranslatedConstraint;
}

const getConstraintMessageId = (constraintType: ConstraintTypes): string => {
    switch (constraintType) {
        case ConstraintTypes.FIELD_REQUIRED:
            return 'fieldSelection.table.label.fieldRequired';
        case ConstraintTypes.LOCATION_REQUIRED:
            return 'fieldSelection.table.label.locationRequired';
        case ConstraintTypes.LOCATION_RECOMMENDED:
            return 'fieldSelection.table.label.locationRecommended';
        case ConstraintTypes.FIELD_OPTIONAL:
            return 'fieldSelection.table.label.fieldOptional';
        case ConstraintTypes.FIELD_FORBIDDEN:
            return 'fieldSelection.table.label.fieldForbidden';
        case ConstraintTypes.UNSATISFIABLE:
            return 'fieldSelection.table.label.unsatisfiable';
        default:
            return 'fieldSelection.table.label.unknown';
    }
};

function ConstraintDetails({ constraint }: Props) {
    const messageId = getConstraintMessageId(constraint.type);

    return (
        <TableCell sx={{ minWidth: 275 }}>
            <Typography sx={{ fontWeight: 500 }}>
                <FormattedMessage id={messageId} />
            </Typography>

            <Typography>{constraint.reason}</Typography>
        </TableCell>
    );
}

export default ConstraintDetails;
