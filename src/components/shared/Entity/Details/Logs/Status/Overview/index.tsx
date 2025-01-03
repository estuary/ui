import { Grid } from '@mui/material';
import ControllerOverview from './ControllerOverview';

export default function Overview() {
    return (
        <Grid container spacing={{ xs: 2 }}>
            <ControllerOverview />
        </Grid>
    );
}
