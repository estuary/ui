import { Box, Tooltip } from '@mui/material';

import { ViewDetailsProps } from './types';
import { useIntl } from 'react-intl';

import LinkWrapper from 'src/components/shared/LinkWrapper';

function EntityNameDetailsLink({ name, path, newWindow }: ViewDetailsProps) {
    const intl = useIntl();

    return (
        <Tooltip
            placement="bottom"
            style={{ maxWidth: 'fit-content' }}
            title={intl.formatMessage({
                id: 'entityTable.detailsLink',
            })}
        >
            <Box>
                <LinkWrapper
                    newWindow={newWindow}
                    ariaLabel={intl.formatMessage(
                        { id: 'entityTable.viewDetails.aria' },
                        { name }
                    )}
                    link={path}
                >
                    {name}
                </LinkWrapper>
            </Box>
        </Tooltip>
    );
}

export default EntityNameDetailsLink;
