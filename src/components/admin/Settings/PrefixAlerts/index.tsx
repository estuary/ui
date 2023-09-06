import { Box, Stack, Typography } from '@mui/material';
import AlertGenerateButton from 'components/admin/Settings/PrefixAlerts/generate/Button';
import PrefixAlertTable from 'components/tables/PrefixAlerts';
import { FormattedMessage } from 'react-intl';

function PrefixAlerts() {
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

                <AlertGenerateButton />
            </Box>

            <PrefixAlertTable />
        </>
    );
}

export default PrefixAlerts;
