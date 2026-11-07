import { Box, Typography } from '@mui/material';

import { TerminalTag } from 'iconoir-react';

import ExternalLink from 'src/components/shared/ExternalLink';

function EditCommandsHeader() {
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
                    CLI
                </Typography>
            </Box>

            <ExternalLink link="https://docs.estuary.dev/concepts/flowctl/">
                Docs
            </ExternalLink>
        </Box>
    );
}

export default EditCommandsHeader;
