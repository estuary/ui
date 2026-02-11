import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionDialog';
import { useTenantStore } from 'src/stores/Tenant/Store';

function AlertGenerateButton() {
    const intl = useIntl();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const { open, setOpen } = useAlertSubscriptionDialog(selectedTenant);

    return (
        <>
            <Button
                variant="outlined"
                onClick={(event) => {
                    event.preventDefault();

                    setOpen(true);
                }}
            >
                {intl.formatMessage({ id: 'alerts.config.cta.addAlertMethod' })}
            </Button>

            <AlertSubscriptionDialog
                headerId="alerts.config.dialog.generate.header"
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}

export default AlertGenerateButton;
