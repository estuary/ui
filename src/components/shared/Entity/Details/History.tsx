import { Box, Grid } from '@mui/material';
import useBrowserTitle from 'hooks/useBrowserTitle';
import DetailTabs from './Tabs';

function History() {
    useBrowserTitle('browserTitle.details');

    return (
        <Box>
            <DetailTabs />
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    This is the history page
                </Grid>
            </Grid>
        </Box>
    );
}

export default History;
