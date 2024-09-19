import LinkWrapper from 'components/shared/LinkWrapper';
import { Box, Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';
import { ViewDetailsProps } from './types';

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
