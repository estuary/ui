import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
} from '@mui/material';
import SaveButton from 'components/admin/Settings/PrefixAlerts/generate/Dialog/SaveButton';
import PrefixedName from 'components/inputs/PrefixedName';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    height?: number;
}

const TITLE_ID = 'generate-prefix-alert-dialog-title';

function GenerateAlertDialog({ open, setOpen }: Props) {
    const intl = useIntl();

    const [prefix, setPrefix] = useState('');
    const [prefixHasErrors, setPrefixHasErrors] = useState(false);

    const [emails, setEmails] = useState<string[]>([]);

    const updatePrefix = (value: string, errors: string | null) => {
        // if (serverError) {
        //     setServerError(null);
        // }

        setPrefix(value);
        setPrefixHasErrors(Boolean(errors));
    };

    const updateEmailList = (value: string, _errors: string | null) => {
        // if (serverError) {
        //     setServerError(null);
        // }

        setEmails(value.split(','));
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
                    <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
                        <PrefixedName
                            allowBlankName
                            allowEndSlash
                            defaultPrefix
                            label={intl.formatMessage({
                                id: 'common.tenant',
                            })}
                            required
                            size="small"
                            validateOnLoad
                            onChange={updatePrefix}
                        />
                    </Grid>

                    <Grid item xs={4} md={7} sx={{ display: 'flex' }}>
                        <TextField
                            size="small"
                            variant="outlined"
                            required
                            label={intl.formatMessage({
                                id: 'data.email',
                            })}
                            InputProps={{
                                sx: { borderRadius: 3 },
                            }}
                            onChange={(event) =>
                                updateEmailList(event.target.value, null)
                            }
                            sx={{ flexGrow: 1 }}
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
                    disabled={prefixHasErrors}
                    prefix={prefix}
                    emails={emails}
                    setOpen={setOpen}
                />
            </DialogActions>
        </Dialog>
    );
}

export default GenerateAlertDialog;
