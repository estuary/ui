import { Box, Stack, Typography } from '@mui/material';

function GrantListItemForTenant({ subjectRole, capability, objectRole }: any) {
    return (
        <Typography component="div">
            <Stack
                direction="row"
                spacing={0.5}
                useFlexGap
                sx={{ flexWrap: 'wrap', lineBreak: 'anywhere' }}
            >
                <Box>
                    <strong>{subjectRole}</strong>
                </Box>
                <Box>removing</Box>
                <Box>
                    <strong>{capability}</strong>
                </Box>
                <Box>on</Box>
                <Box>
                    <strong>{objectRole}</strong>
                </Box>
            </Stack>
        </Typography>
    );
}

export default GrantListItemForTenant;
