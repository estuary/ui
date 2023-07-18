import { TableCell, Typography } from '@mui/material';
import {
    Constraint,
    ConstraintType,
} from 'components/editor/Bindings/FieldSelection/types';
import { FormattedMessage } from 'react-intl';

interface Props {
    constraint: Constraint;
}

const getConstraintMessageId = (constraintType: ConstraintType): string => {
    switch (constraintType) {
        case 'FIELD_REQUIRED':
            return 'fieldSelection.table.label.fieldRequired';
        case 'LOCATION_REQUIRED':
            return 'fieldSelection.table.label.locationRequired';
        case 'LOCATION_RECOMMENDED':
            return 'fieldSelection.table.label.locationRecommended';
        case 'FIELD_OPTIONAL':
            return 'fieldSelection.table.label.fieldOptional';
        case 'FIELD_FORBIDDEN':
            return 'fieldSelection.table.label.fieldForbidden';
        case 'UNSATISFIABLE':
            return 'fieldSelection.table.label.unsatisfiable';
        default:
            return '';
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
