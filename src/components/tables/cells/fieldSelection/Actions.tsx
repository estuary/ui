import { Button, Stack, TableCell } from '@mui/material';
import {
    Constraint,
    ConstraintType,
} from 'components/editor/Bindings/FieldSelection/types';
import { FormattedMessage } from 'react-intl';

interface Props {
    constraint: Constraint;
}

const setActionTypes = (constraintType: ConstraintType): string[] => {
    switch (constraintType) {
        case 'FIELD_REQUIRED':
        case 'LOCATION_REQUIRED':
            return ['add'];
        case 'LOCATION_RECOMMENDED':
        case 'FIELD_OPTIONAL':
            return ['rename', 'remove'];
        default:
            return [];
    }
};

function Actions({ constraint }: Props) {
    const actionTypes: string[] = setActionTypes(constraint.type);

    if (actionTypes.length > 0) {
        return (
            <TableCell>
                <Stack spacing={1} direction="row">
                    {actionTypes.includes('add') ? (
                        <Button size="small" variant="outlined">
                            <FormattedMessage id="fieldSelection.table.cta.addProjection" />
                        </Button>
                    ) : null}

                    {actionTypes.includes('rename') ? (
                        <Button size="small" variant="outlined">
                            <FormattedMessage id="fieldSelection.table.cta.renameField" />
                        </Button>
                    ) : null}

                    {actionTypes.includes('remove') ? (
                        <Button size="small" variant="outlined" color="error">
                            <FormattedMessage id="cta.delete" />
                        </Button>
                    ) : null}
                </Stack>
            </TableCell>
        );
    } else {
        return <TableCell />;
    }
}

export default Actions;
