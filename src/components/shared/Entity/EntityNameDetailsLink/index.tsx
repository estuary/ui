import type { ViewDetailsProps } from 'src/components/shared/Entity/EntityNameDetailsLink/types';

import { Box, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import LinkWrapper from 'src/components/shared/LinkWrapper';

function EntityNameDetailsLink({
    name,
    path,
    newWindow,
    plain,
}: ViewDetailsProps) {
    const intl = useIntl();

    const link = (
        <LinkWrapper
            newWindow={newWindow}
            ariaLabel={intl.formatMessage(
                { id: 'entityTable.viewDetails.aria' },
                { name }
            )}
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
            title={intl.formatMessage({
                id: 'entityTable.detailsLink',
            })}
        >
            <Box>{link}</Box>
        </Tooltip>
    );
}

export default EntityNameDetailsLink;
