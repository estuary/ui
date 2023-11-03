import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    ListItem,
    TextField,
    Typography,
} from '@mui/material';
import SaveButton from 'components/admin/Settings/PrefixAlerts/generate/Dialog/SaveButton';
import PrefixSelector from 'components/inputs/PrefixedName/PrefixSelector';
import useUserInformationByPrefix from 'hooks/useUserInformationByPrefix';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    height?: number;
}

const simpleEmailRegEx = new RegExp(/.+@.+/m);

const TITLE_ID = 'generate-prefix-alert-dialog-title';

function GenerateAlertDialog({ open, setOpen }: Props) {
    const intl = useIntl();

    const [prefix, setPrefix] = useState('');
    const [prefixHasErrors, setPrefixHasErrors] = useState(false);

    const [emails, setEmails] = useState<string[]>([]);

    const { data, isValidating } = useUserInformationByPrefix(prefix, 'admin');

    console.log('prefix', prefix);
    console.log('validating', isValidating);
    console.log('user info', data);

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

    const [inputValue, setInputValue] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);

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
                        <FormControl fullWidth>
                            <PrefixSelector
                                label={intl.formatMessage({
                                    id: 'common.tenant',
                                })}
                                defaultPrefix
                                prefixOnly
                                onChange={updatePrefix}
                            />
                        </FormControl>
                    </Grid>

                    {/* <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
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
                    </Grid> */}

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
                            onChange={
                                // () => console.log('email changed')
                                (event) =>
                                    updateEmailList(event.target.value, null)
                            }
                            sx={{ flexGrow: 1 }}
                        />
                    </Grid>

                    <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
                        <Autocomplete
                            disableClearable
                            disableCloseOnSelect
                            filterSelectedOptions
                            freeSolo
                            getOptionLabel={(option) =>
                                typeof option !== 'string'
                                    ? option.user_email
                                    : option
                            }
                            inputValue={inputValue}
                            multiple
                            onChange={(_event, values, reason, details) => {
                                console.log('auto changed val', values);
                                console.log('auto changed reason', reason);
                                console.log('auto changed details', details);

                                if (inputError) {
                                    setInputError(null);
                                }

                                const newValue = values[values.length - 1];

                                if (
                                    reason === 'createOption' &&
                                    typeof newValue === 'string'
                                ) {
                                    console.log(
                                        'errors',
                                        values.filter(
                                            (value) =>
                                                typeof value === 'string' &&
                                                !simpleEmailRegEx.test(value)
                                        )
                                    );

                                    console.log(
                                        'reg',
                                        !simpleEmailRegEx.test(newValue)
                                    );

                                    if (!simpleEmailRegEx.test(newValue)) {
                                        setInputError(
                                            'Email is not formatted properly.'
                                        );

                                        setInputValue(newValue);

                                        return;
                                    }
                                }

                                const updatedEmails = values.map((value) =>
                                    typeof value === 'string'
                                        ? value
                                        : value.user_email
                                );

                                console.log('updated email', updatedEmails);

                                setEmails(updatedEmails);
                            }}
                            onInputChange={(_event, value, reason) => {
                                console.log('auto input changed val', value);
                                console.log(
                                    'auto input changed reason',
                                    reason
                                );

                                setInputValue(value);

                                if (inputError) {
                                    setInputError(null);
                                }

                                if (value.endsWith(',')) {
                                    console.log('COMMA');
                                    if (!simpleEmailRegEx.test(value)) {
                                        setInputError(
                                            'Email is not formatted properly.'
                                        );

                                        return;
                                    }
                                    console.log(
                                        'AHHHHH',
                                        value.substring(0, value.length - 1)
                                    );

                                    const updatedEmails = [
                                        ...emails,
                                        value.substring(0, value.length - 1),
                                    ];

                                    setEmails(updatedEmails);
                                    setInputValue('');
                                }
                            }}
                            options={data.filter(
                                ({ user_email }) => !emails.includes(user_email)
                            )}
                            renderInput={({
                                InputProps,
                                ...params
                            }: AutocompleteRenderInputParams) => (
                                <TextField
                                    {...params}
                                    InputProps={{
                                        ...InputProps,
                                        sx: { borderRadius: 3 },
                                    }}
                                    error={inputError !== null}
                                    label={intl.formatMessage({
                                        id: 'data.email',
                                    })}
                                    required
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                            renderOption={(
                                renderOptionProps,
                                option,
                                state
                            ) => {
                                console.log('auto prop', renderOptionProps);
                                console.log('auto option', option);
                                console.log('auto prop', state);

                                return (
                                    <ListItem
                                        key={option.user_id}
                                        {...renderOptionProps}
                                    >
                                        {option.user_full_name ? (
                                            <Typography>
                                                {option.user_full_name}
                                            </Typography>
                                        ) : null}

                                        {option.user_email ? (
                                            <Typography>
                                                {option.user_email}
                                            </Typography>
                                        ) : null}
                                    </ListItem>
                                );
                            }}
                            sx={{ flexGrow: 1 }}
                            value={emails}
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
                    setOpen={setOpen}
                    emails={emails}
                />
            </DialogActions>
        </Dialog>
    );
}

export default GenerateAlertDialog;
