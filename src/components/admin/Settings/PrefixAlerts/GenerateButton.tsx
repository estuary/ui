import type { AlertGenerateButtonProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useEffect } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionDialog';
import { useTenantStore } from 'src/stores/Tenant/Store';

function AlertGenerateButton({
    fetching,
    executeQuery,
}: AlertGenerateButtonProps) {
    const intl = useIntl();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const { open, setOpen } = useAlertSubscriptionDialog(selectedTenant);

    useEffect(() => {
        if (fetching) return;

        executeQuery({ requestPolicy: 'network-only' });
    }, [executeQuery, fetching, open]);

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
