import { Box, Button, Stack, Typography } from '@mui/material';
import PrefixAlertTable from 'components/tables/PrefixAlerts';
import { FormattedMessage } from 'react-intl';

function Alerts() {
    return (
        <>
            <Box sx={{ pb: 2, px: 2 }}>
                <Stack direction="column" spacing={2} sx={{ m: 2, ml: 0 }}>
                    <Typography
                        component="span"
                        variant="h6"
                        sx={{
                            alignItems: 'center',
                        }}
                    >
                        <FormattedMessage id="admin.alerts.header" />
                    </Typography>
                </Stack>

                <Button variant="outlined">
                    <FormattedMessage id="admin.alerts.cta.addAlertMethod" />
                </Button>
            </Box>

            <PrefixAlertTable />
        </>
    );
}

export default Alerts;
