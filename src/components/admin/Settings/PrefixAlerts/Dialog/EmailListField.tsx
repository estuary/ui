import { Grid } from '@mui/material';

import EmailSelector from 'src/components/admin/Settings/PrefixAlerts/EmailSelector';

export default function EmailListField() {
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
            <EmailSelector />
        </Grid>
    );
}
