import { useIntl } from 'react-intl';

import { Box, Stack, TableCell, Tooltip } from '@mui/material';

import LinkWrapper from 'components/shared/LinkWrapper';
import EntityStatus from 'components/tables/cells/EntityStatus';

interface Props {
    name: string;
    showEntityStatus: boolean;
    detailsLink: string;
}

function EntityNameLink({ name, detailsLink, showEntityStatus }: Props) {
    const intl = useIntl();

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
                {showEntityStatus ? <EntityStatus name={name} /> : null}

                <Tooltip
                    title={intl.formatMessage({
                        id: 'entityTable.detailsLink',
                    })}
                >
                    <Box>
                        <LinkWrapper link={detailsLink}>{name}</LinkWrapper>
                    </Box>
                </Tooltip>
            </Stack>
        </TableCell>
    );
}

export default EntityNameLink;
