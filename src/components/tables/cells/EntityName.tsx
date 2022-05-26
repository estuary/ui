import { TableCell } from '@mui/material';
import EntityStatus from 'components/tables/cells/EntityStatus';
import { tableBorderSx } from 'context/Theme';

interface Props {
    name: string;
    showEntityStatus: boolean;
}

function EntityName({ name, showEntityStatus }: Props) {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                minWidth: 256,
            }}
        >
            <>
                {showEntityStatus ? <EntityStatus name={name} /> : null}
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
