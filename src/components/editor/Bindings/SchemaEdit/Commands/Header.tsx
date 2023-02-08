import { Box, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { TerminalTag } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

function EditCommandsHeader() {
    const intl = useIntl();

    return (
        <Box
            sx={{
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TerminalTag />

                <Typography variant="h6" sx={{ ml: 1 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaEdit.header" />
                </Typography>
            </Box>

            <ExternalLink
                link={intl.formatMessage({
                    id: 'workflows.collectionSelector.schemaEdit.flowctlDocLink',
                })}
            >
                <FormattedMessage id="terms.documentation" />
            </ExternalLink>
        </Box>
    );
}

export default EditCommandsHeader;
