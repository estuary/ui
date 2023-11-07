import { Typography } from '@mui/material';
import PrefixAlertTable from 'components/tables/PrefixAlerts';
import { FormattedMessage } from 'react-intl';

function PrefixAlerts() {
    return (
        <>
            <Typography
                component="div"
                variant="h6"
                sx={{ m: 2, alignItems: 'center' }}
            >
                <FormattedMessage id="admin.alerts.header" />
            </Typography>

            <PrefixAlertTable />
        </>
    );
}

export default PrefixAlerts;
