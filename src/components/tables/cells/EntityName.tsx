import { TableCell } from '@mui/material';
import EntityStatus from 'components/tables/cells/EntityStatus';

interface Props {
    name: string;
}

function EntityName({ name }: Props) {
    return (
        <TableCell
            sx={{
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
