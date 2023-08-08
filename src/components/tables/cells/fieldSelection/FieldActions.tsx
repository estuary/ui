import { TableCell } from '@mui/material';
import {
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import CustomSelectionOptions from 'components/tables/cells/fieldSelection/CustomSelectionOptions';

interface Props {
    field: string;
    constraint: TranslatedConstraint;
    selectionType: FieldSelectionType | null;
}

function FieldActions({ field, constraint }: Props) {
    return (
        <TableCell>
            <CustomSelectionOptions field={field} constraint={constraint} />
        </TableCell>
    );
}

export default FieldActions;
