import { TableCell } from '@mui/material';
import EntityStatus from 'components/tables/cells/EntityStatus';
import { tableBorderSx } from 'context/Theme';
import { ShardDetailStoreNames } from 'context/Zustand';

interface Props {
    name: string;
    showEntityStatus: boolean;
    shardDetailStoreName?: ShardDetailStoreNames;
}

function EntityName({ name, showEntityStatus, shardDetailStoreName }: Props) {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                minWidth: 256,
            }}
        >
            <>
                {showEntityStatus && shardDetailStoreName ? (
                    <EntityStatus
                        name={name}
                        shardDetailStoreName={shardDetailStoreName}
                    />
                ) : null}
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
