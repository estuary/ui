import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Chip,
    FormControl,
    FormHelperText,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from '@mui/material';
import { EmailDictionary } from 'components/admin/Settings/PrefixAlerts/types';
import usePrefixAdministrators from 'hooks/usePrefixAdministrators';
import useUserInformationByPrefix from 'hooks/useUserInformationByPrefix';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Grant_UserExt } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    prefix: string;
    emailsByPrefix: EmailDictionary;
    setEmailsByPrefix: Dispatch<SetStateAction<EmailDictionary>>;
}

const simpleEmailRegEx = new RegExp(/.+@.+/m);

const minCapability = 'admin';

function EmailSelector({ prefix, emailsByPrefix, setEmailsByPrefix }: Props) {
    const intl = useIntl();

    const [inputValue, setInputValue] = useState('');
    // const [inputErrorExists, setInputErrorExists] = useState(false);

    const { data: adminPrefixes } = usePrefixAdministrators(
        prefix,
        minCapability
    );

    const { data: userInfo } = useUserInformationByPrefix(
        [prefix, ...adminPrefixes],
        minCapability
    );

    const emails = useMemo(
        () =>
            Object.hasOwn(emailsByPrefix, prefix) ? emailsByPrefix[prefix] : [],
        [prefix, emailsByPrefix]
    );

    const inputErrorExists = useMemo(
        () => emails.some((email) => !simpleEmailRegEx.test(email)),
        [emails]
    );

    return (
        <FormControl fullWidth>
            <Autocomplete
                disabled={!prefix}
                disableCloseOnSelect
                filterOptions={(options) =>
                    options.filter((option) => {
                        if (typeof option === 'string') {
                            return option.includes(inputValue);
                        }

                        if (option.user_full_name) {
                            return (
                                option.user_email.includes(inputValue) ||
                                option.user_full_name.includes(inputValue)
                            );
                        }

                        return option.user_email.includes(inputValue);
                    })
                }
                freeSolo
                getOptionLabel={(option) =>
                    typeof option !== 'string' ? option.user_email : option
                }
                handleHomeEndKeys
                inputValue={inputValue}
                multiple
                onChange={(_event, values, reason) => {
                    const newValue = values[values.length - 1];

                    if (
                        reason === 'createOption' &&
                        typeof newValue === 'string' &&
                        !simpleEmailRegEx.test(newValue)
                    ) {
                        setInputValue('');
                    }

                    const modifiedEmails = values.flatMap((value) => {
                        if (typeof value === 'string') {
                            if (value.includes(',') || value.endsWith(',')) {
                                const enteredEmails = value
                                    .split(',')
                                    .map((email) => email.trim())
                                    .filter((email) => hasLength(email));

                                return enteredEmails;
                            }

                            return value;
                        }

                        return value.user_email;
                    });

                    setEmailsByPrefix({
                        ...emailsByPrefix,
                        [prefix]: modifiedEmails,
                    });
                }}
                onInputChange={(_event, value) => {
                    setInputValue(value);

                    if (value.includes(',') || value.endsWith(',')) {
                        const enteredEmails = value
                            .split(',')
                            .map((email) => email.trim())
                            .filter((email) => hasLength(email));

                        setEmailsByPrefix({
                            ...emailsByPrefix,
                            [prefix]: [...emails, ...enteredEmails],
                        });

                        setInputValue('');
                    }
                }}
                options={
                    userInfo.filter(
                        ({ user_email }) => !emails.includes(user_email)
                    ) as (Grant_UserExt | string)[]
                }
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
                        error={inputErrorExists}
                        label={intl.formatMessage({
                            id: 'data.email',
                        })}
                        required
                        size="small"
                        variant="outlined"
                    />
                )}
                renderOption={(renderOptionProps, option) => {
                    return typeof option === 'string' ? (
                        <Typography>{option}</Typography>
                    ) : (
                        <ListItem key={option.user_id} {...renderOptionProps}>
                            <ListItemText
                                primary={option.user_full_name}
                                secondary={option.user_email}
                                primaryTypographyProps={{
                                    sx: {
                                        fontWeight: 500,
                                        fontSize: 16,
                                    },
                                }}
                                secondaryTypographyProps={{
                                    sx: {
                                        color: (theme) =>
                                            theme.palette.text.primary,
                                    },
                                }}
                            />
                            {/* {option.user_full_name ||
                            option.user_email.split('@')[0] ? (
                                <Typography component={Box}>
                                    {option.user_full_name ??
                                        option.user_email.split('@')[0]}
                                </Typography>
                            ) : null}

                            {option.user_email ? (
                                <Typography>{option.user_email}</Typography>
                            ) : null} */}
                        </ListItem>
                    );
                }}
                renderTags={(values, getTagProps) => {
                    return values.map((value, index) => {
                        const tagProps = getTagProps({ index });

                        const email =
                            typeof value === 'string'
                                ? value
                                : value.user_email;

                        return (
                            <Chip
                                {...tagProps}
                                color={
                                    !simpleEmailRegEx.test(email)
                                        ? 'error'
                                        : 'default'
                                }
                                key={`email-tag-${email}`}
                                label={email}
                                size="small"
                            />
                        );
                    });
                }}
                sx={{ flexGrow: 1 }}
                value={emails}
            />

            {inputErrorExists ? (
                <FormHelperText error={inputErrorExists}>
                    <FormattedMessage id="admin.alerts.dialog.emailSelector.inputError" />
                </FormHelperText>
            ) : null}
        </FormControl>
    );
}

export default EmailSelector;
