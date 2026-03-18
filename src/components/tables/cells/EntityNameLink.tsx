import type { EntityNameLinkProps } from 'src/components/tables/cells/types';

import { Stack, TableCell } from '@mui/material';

import EntityNameDetailsLink from 'src/components/shared/Entity/EntityNameDetailsLink';
import EntityStatus from 'src/components/tables/cells/EntityStatus';
import { getTableComponents } from 'src/utils/table-utils';

function EntityNameLink({
    name,
    detailsLink,
    entityStatusTypes,
    showEntityStatus,
    enableDivRendering,
}: EntityNameLinkProps) {
    const { tdComponent } = getTableComponents(enableDivRendering);
    return (
        <TableCell
            component={tdComponent}
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
