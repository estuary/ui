import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
import SaveButton from 'components/admin/Settings/PrefixAlerts/Dialog/SaveButton';
import EmailSelector from 'components/admin/Settings/PrefixAlerts/EmailSelector';
import PrefixedName from 'components/inputs/PrefixedName';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PrefixSubscriptionDictionary } from 'utils/notification-utils';

interface Props {
    headerId: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    subscriptions: PrefixSubscriptionDictionary;
    staticPrefix?: string;
}

const TITLE_ID = 'alert-subscription-dialog-title';

function AlertSubscriptionDialog({
    headerId,
    open,
    setOpen,
    subscriptions,
    staticPrefix,
}: Props) {
    const intl = useIntl();

    const [prefix, setPrefix] = useState(staticPrefix ? staticPrefix : '');
    const [prefixHasErrors, setPrefixHasErrors] = useState(false);

    const [emails, setEmails] = useState<string[]>([]);
    const [subscriptionsToCancel, setSubscriptionsToCancel] = useState<
        string[]
    >([]);

    const subscribedEmails = useMemo(
        () =>
            prefix && Object.hasOwn(subscriptions, prefix)
                ? subscriptions[prefix].userSubscriptions.map(
                      ({ email }) => email
                  )
                : [],
        [prefix, subscriptions]
    );

    useEffect(() => {
        if (open) {
            setEmails(subscribedEmails);
        }
    }, [open, setEmails, subscribedEmails]);

    const updatePrefix = (value: string, errors: string | null) => {
        // if (serverError) {
        //     setServerError(null);
        // }

        setPrefix(value);
        setPrefixHasErrors(Boolean(errors));

        setSubscriptionsToCancel([]);
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
            <DialogTitle>
                <FormattedMessage id={headerId} />
            </DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="admin.alerts.dialog.description" />
                </Typography>

                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 3, pt: 1, alignItems: 'flex-start' }}
                >
                    <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                        {staticPrefix ? (
                            <TextField
                                InputProps={{
                                    sx: { borderRadius: 3 },
                                }}
                                fullWidth
                                label={intl.formatMessage({
                                    id: 'common.tenant',
                                })}
                                required
                                size="small"
                                value={staticPrefix}
                                variant="outlined"
                            />
                        ) : (
                            <PrefixedName
                                label={intl.formatMessage({
                                    id: 'common.tenant',
                                })}
                                onChange={updatePrefix}
                                prefixOnly
                                required
                                size="small"
                                validateOnLoad
                            />
                        )}
                    </Grid>

                    <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
                        <EmailSelector
                            emails={emails}
                            prefix={prefix}
                            setEmails={setEmails}
                            setSubscriptionsToCancel={setSubscriptionsToCancel}
                            subscribedEmails={subscribedEmails}
                            subscriptionsToCancel={subscriptionsToCancel}
                        />
                    </Grid>

                    {/* <Grid item xs={12}>
                        <Button
                            size="small"
                            variant="text"
                            startIcon={<AddCircle />}
                        >
                            Add alert method
                        </Button>
                    </Grid> */}
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={(event: React.MouseEvent<HTMLElement>) => {
                        event.preventDefault();

                        setOpen(false);
                    }}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <SaveButton
                    disabled={Boolean(prefixHasErrors)}
                    prefix={prefix}
                    setOpen={setOpen}
                    subscriptionsToCancel={subscriptionsToCancel}
                    subscriptionsToCreate={emails.filter(
                        (email) => !subscribedEmails.includes(email)
                    )}
                />
            </DialogActions>
        </Dialog>
    );
}

export default AlertSubscriptionDialog;
