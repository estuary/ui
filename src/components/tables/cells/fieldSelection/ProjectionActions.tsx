import { Button, Stack, TableCell } from '@mui/material';
import EditProjectionButton from 'components/editor/Bindings/FieldSelection/EditProjection/Button';
import {
    ConstraintTypes,
    Projection,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import { FormattedMessage } from 'react-intl';

interface Props {
    projection: Projection;
    constraint: TranslatedConstraint;
}

const setActionTypes = (constraintType: ConstraintTypes): string[] => {
    switch (constraintType) {
        case ConstraintTypes.FIELD_REQUIRED:
        case ConstraintTypes.LOCATION_REQUIRED:
            return ['add'];
        case ConstraintTypes.LOCATION_RECOMMENDED:
        case ConstraintTypes.FIELD_OPTIONAL:
            return ['rename', 'remove'];
        default:
            return [];
    }
};

function ProjectionActions({ projection, constraint }: Props) {
    const actionTypes: string[] = setActionTypes(constraint.type);

    if (actionTypes.length > 0) {
        return (
            <TableCell>
                <Stack spacing={1} direction="row">
                    {actionTypes.includes('add') ? (
                        <EditProjectionButton
                            operation="addProjection"
                            projection={projection}
                        />
                    ) : null}

                    {actionTypes.includes('rename') ? (
                        <EditProjectionButton
                            operation="renameField"
                            projection={projection}
                        />
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

export default ProjectionActions;
