import { Box, Stack, Typography } from '@mui/material';

function GrantListItemForUser({ identifier, capability, objectRole }: any) {
    return (
        <Typography>
            <Stack
                direction="row"
                spacing={0.5}
                useFlexGap
                sx={{ flexWrap: 'wrap', lineBreak: 'anywhere' }}
            >
                <Box>
                    <strong>{identifier}</strong>
                </Box>
                <Box>removing</Box>
                <Box>
                    <strong>{capability}</strong>
                </Box>
                <Box>access to</Box>
                <Box>
                    <strong>{objectRole}</strong>
                </Box>
            </Stack>
        </Typography>
    );
}

export default GrantListItemForUser;
