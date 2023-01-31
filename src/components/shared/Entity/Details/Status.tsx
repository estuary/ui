import { Grid, Typography } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import ShardInformation from './ShardInformation';

function Status() {
    const entityType = useEntityType();

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography>
                    Below you can find a list of all shards running this{' '}
                    {entityType} and the corresponding status.
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <ShardInformation entityType={entityType} />
            </Grid>
        </Grid>
    );
}

export default Status;
