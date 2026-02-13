import { useEffect } from 'react';

import { Grid, Skeleton } from '@mui/material';

import EmailSelector from 'src/components/admin/Settings/PrefixAlerts/EmailSelector';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

interface Props {
    open: boolean;
}

export default function EmailListField({ open }: Props) {
    const subscriptions = useAlertSubscriptionsStore(
        (state) => state.subscriptions
    );

    const serverError = useAlertSubscriptionsStore(
        (state) => state.initializationError
    );

    const prefix = useAlertSubscriptionsStore((state) => state.prefix);

    const existingEmails = useAlertSubscriptionsStore(
        (state) => state.existingEmails
    );
    const [updatedEmails, setUpdatedEmails] = useAlertSubscriptionsStore(
        (state) => [state.updatedEmails, state.setUpdatedEmails]
    );

    useEffect(() => {
        if (
            open &&
            prefix &&
            Object.hasOwn(existingEmails, prefix) &&
            !Object.hasOwn(updatedEmails, prefix)
        ) {
            setUpdatedEmails({
                ...updatedEmails,
                [prefix]: existingEmails[prefix],
            });
        }
    }, [open, prefix, existingEmails, setUpdatedEmails, updatedEmails]);

    return (
        <Grid
            item
            xs={12}
            sx={{
                maxHeight: 250,
                overflow: 'auto',
                display: 'flex',
            }}
        >
            {subscriptions === undefined ? (
                <Skeleton height={38} width={490} />
            ) : (
                <EmailSelector
                    disabled={!!serverError}
                    emailsByPrefix={updatedEmails}
                    prefix={prefix}
                    setEmailsByPrefix={setUpdatedEmails}
                />
            )}
        </Grid>
    );
}
