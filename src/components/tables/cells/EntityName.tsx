import { TableCell } from '@mui/material';
import EntityStatus from 'components/tables/cells/EntityStatus';
import { tableBorderSx } from 'context/Theme';

interface Props {
    name: string;
}

function EntityName({ name }: Props) {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                minWidth: 256,
            }}
        >
            <>
                <EntityStatus />
                <span
                    style={{
                        verticalAlign: 'middle',
                    }}
                >
                    {name}
                </span>
            </>
        </TableCell>
    );
}

export default EntityName;
