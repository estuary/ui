import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import SaveButton from 'components/admin/Settings/PrefixAlerts/Dialog/SaveButton';
import EmailSelector from 'components/admin/Settings/PrefixAlerts/EmailSelector';
import { EmailDictionary } from 'components/admin/Settings/PrefixAlerts/types';
import PrefixedName from 'components/inputs/PrefixedName';
import { Cancel } from 'iconoir-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
    const theme = useTheme();

    const [prefix, setPrefix] = useState(staticPrefix ? staticPrefix : '');
    const [prefixHasErrors, setPrefixHasErrors] = useState(false);

    const [existingEmails, setExistingEmails] = useState<EmailDictionary>({});
    const [updatedEmails, setUpdatedEmails] = useState<EmailDictionary>({});

    useEffect(() => {
        if (open) {
            const emails = {};

            Object.entries(subscriptions).forEach(([key, value]) => {
                emails[key] = value.userSubscriptions.map(({ email }) => email);
            });

            setExistingEmails(emails);
        }
    }, [open, subscriptions, setExistingEmails]);

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

    const updatePrefix = (value: string, errors: string | null) => {
        setPrefix(value);
        setPrefixHasErrors(Boolean(errors));
    };

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setUpdatedEmails({});
        setOpen(false);
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth aria-labelledby={TITLE_ID}>
            <DialogTitle
                component="div"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6">
                    <FormattedMessage id={headerId} />
                </Typography>

                <IconButton onClick={closeDialog}>
                    <Cancel
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="admin.alerts.dialog.description" />
                </Typography>

                <Grid
                    container
                    spacing={2}
                    sx={{
                        mb: 3,
                        pt: 1,
                        alignItems: 'flex-start',
                    }}
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
                        <EmailSelector
                            prefix={prefix}
                            emailsByPrefix={updatedEmails}
                            setEmailsByPrefix={setUpdatedEmails}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" size="small" onClick={closeDialog}>
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <SaveButton
                    disabled={Boolean(prefixHasErrors)}
                    existingEmails={existingEmails}
                    prefix={prefix}
                    setOpen={setOpen}
                    updatedEmails={updatedEmails}
                />
            </DialogActions>
        </Dialog>
    );
}

export default AlertSubscriptionDialog;
