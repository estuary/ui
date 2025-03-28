import { Stack, TableCell } from '@mui/material';

import EntityNameDetailsLink from 'src/components/shared/Entity/EntityNameDetailsLink';
import EntityStatus from 'src/components/tables/cells/EntityStatus';
import { ShardEntityTypes } from 'src/stores/ShardDetail/types';

interface Props {
    name: string;
    showEntityStatus: boolean;
    entityStatusTypes: ShardEntityTypes[];
    detailsLink: string;
}

function EntityNameLink({
    name,
    detailsLink,
    entityStatusTypes,
    showEntityStatus,
}: Props) {
    return (
        <TableCell
            sx={{
                minWidth: 250,
                maxWidth: 'min-content',
            }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                }}
            >
                {showEntityStatus ? (
                    <EntityStatus name={name} taskTypes={entityStatusTypes} />
                ) : null}

                <EntityNameDetailsLink name={name} path={detailsLink} />
            </Stack>
        </TableCell>
    );
}

export default EntityNameLink;
