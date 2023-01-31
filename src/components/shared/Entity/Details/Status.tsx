import { Box, Grid } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import useBrowserTitle from 'hooks/useBrowserTitle';
import ShardInformation from './ShardInformation';
import DetailTabs from './Tabs';

function Status() {
    useBrowserTitle('browserTitle.details');
    const entityType = useEntityType();

    return (
        <Box>
            <DetailTabs />
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <ShardInformation entityType={entityType} />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Status;
