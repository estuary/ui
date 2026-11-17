import type { ViewDetailsProps } from 'src/components/shared/Entity/EntityNameDetailsLink/types';

import { Box, Tooltip } from '@mui/material';

import LinkWrapper from 'src/components/shared/LinkWrapper';

function EntityNameDetailsLink({
    name,
    path,
    newWindow,
    plain,
}: ViewDetailsProps) {
    const link = (
        <LinkWrapper
            newWindow={newWindow}
            ariaLabel={`View details of ${name}`}
            link={path}
            plain={plain}
        >
            {name}
        </LinkWrapper>
    );

    if (plain) {
        return link;
    }

    return (
        <Tooltip
            placement="bottom"
            style={{ maxWidth: 'fit-content' }}
            title="View details"
        >
            <Box>{link}</Box>
        </Tooltip>
    );
}

export default EntityNameDetailsLink;
