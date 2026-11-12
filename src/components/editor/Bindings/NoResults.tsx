import { Box } from '@mui/material';

function NoResults() {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            No results found.
        </Box>
    );
}

export default NoResults;
