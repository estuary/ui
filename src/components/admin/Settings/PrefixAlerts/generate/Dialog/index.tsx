import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
} from '@mui/material';
import EmailSelector from 'components/admin/Settings/PrefixAlerts/EmailSelector';
import SaveButton from 'components/admin/Settings/PrefixAlerts/generate/Dialog/SaveButton';
import PrefixedName from 'components/inputs/PrefixedName';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { PrefixSubscriptionDictionary } from 'utils/notification-utils';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    subscriptions: PrefixSubscriptionDictionary;
    height?: number;
}

const TITLE_ID = 'generate-prefix-alert-dialog-title';

function GenerateAlertDialog({ open, setOpen, subscriptions }: Props) {
    const intl = useIntl();

    // const { data, isValidating } = useNotificationSubscriptions();

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);
    const singleOption = objectRoles.length === 1;

    const [prefix, setPrefix] = useState(singleOption ? objectRoles[0] : '');
    const [prefixHasErrors, setPrefixHasErrors] = useState(false);

    const [emails, setEmails] = useState<string[]>([]);

    useEffect(() => {
        if (prefix && Object.hasOwn(subscriptions, prefix)) {
            const subscribedEmails = subscriptions[
                prefix
            ].userSubscriptions.map(({ email }) => email);

            setEmails(subscribedEmails);
        }
    }, [prefix, setEmails, subscriptions]);

    const updatePrefix = (value: string, errors: string | null) => {
        // if (serverError) {
        //     setServerError(null);
        // }

        setPrefix(value);
        setPrefixHasErrors(Boolean(errors));
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
            <DialogTitle>
                <FormattedMessage id="admin.alerts.dialog.generate.header" />
            </DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 3, pt: 1, alignItems: 'flex-start' }}
                >
                    {/* <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                        <FormControl fullWidth>
                            <PrefixSelector
                                label={intl.formatMessage({
                                    id: 'common.tenant',
                                })}
                                prefixOnly
                                onChange={updatePrefix}
                            />
                        </FormControl>
                    </Grid> */}

                    <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                        <PrefixedName
                            label={intl.formatMessage({
                                id: 'common.tenant',
                            })}
                            required
                            size="small"
                            onChange={updatePrefix}
                            prefixOnly
                            validateOnLoad
                        />
                    </Grid>

                    <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
                        <EmailSelector
                            emails={emails}
                            prefix={prefix}
                            setEmails={setEmails}
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
                        setPrefix('');
                        setEmails([]);

                        setOpen(false);
                    }}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <SaveButton
                    disabled={Boolean(prefixHasErrors)}
                    prefix={prefix}
                    setOpen={setOpen}
                    emails={emails}
                />
            </DialogActions>
        </Dialog>
    );
}

export default GenerateAlertDialog;
