import { Button, Grid, Stack, Typography } from '@mui/material';

function DeleteRecordings() {
    return (
        <Grid item xs={12} md={9}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
                Delete My Recordings
            </Typography>

            <Typography>
                At anytime you may delete all session recordings that are
                stored. They will always auto-delete after 1 month.
            </Typography>

            <Stack
                spacing={1}
                sx={{
                    alignItems: 'start',
                    maxWidth: 'fit-content',
                }}
            >
                <Button>Request Recording Deletion</Button>
            </Stack>
        </Grid>
    );
}

export default DeleteRecordings;
