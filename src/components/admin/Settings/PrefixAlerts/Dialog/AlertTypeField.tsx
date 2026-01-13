import { Grid } from '@mui/material';

import AlertTypeSelector from 'src/components/admin/Settings/PrefixAlerts/Dialog/AlertTypeSelector';

const AlertTypeField = () => {
    return (
        <Grid
            item
            xs={12}
            md={7}
            sx={{
                maxHeight: 250,
                overflow: 'auto',
                display: 'flex',
            }}
        >
            <AlertTypeSelector />
        </Grid>
    );
};

export default AlertTypeField;
