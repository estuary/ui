import { Grid, Skeleton } from '@mui/material';
import { useEffect } from 'react';
import EmailSelector from '../EmailSelector';
import useAlertSubscriptionsStore from '../useAlertSubscriptionsStore';

interface Props {
    open: boolean;
}

export default function EmailListField({ open }: Props) {
    const subscriptions = useAlertSubscriptionsStore(
        (state) => state.subscriptions
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
            md={7}
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
                    prefix={prefix}
                    emailsByPrefix={updatedEmails}
                    setEmailsByPrefix={setUpdatedEmails}
                />
            )}
        </Grid>
    );
}
