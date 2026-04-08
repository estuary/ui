import type { AutocompleteRenderInputParams } from '@mui/material';
import type { Grant_UserExt } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import {
    Autocomplete,
    FormControl,
    FormHelperText,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import UserAvatar from 'src/components/shared/UserAvatar';
import usePrefixAdministrators from 'src/hooks/usePrefixAdministrators';
import useUserInformationByPrefix from 'src/hooks/useUserInformationByPrefix';
import { BASIC_EMAIL_RE } from 'src/validation';

type Option = Grant_UserExt | string;

const minCapability = 'admin';

const sanitizeEmail = (value: string) => {
    return value.trim();
};

function EmailSelector() {
    const intl = useIntl();

    const serverError = useAlertSubscriptionsStore(
        (state) => state.initializationError
    );
    const [prefix, subscribedEmail, setSubscribedEmail, setEmailErrorsExist] =
        useAlertSubscriptionsStore((state) => [
            state.subscription.catalogPrefix,
            state.subscription.email,
            state.setSubscribedEmail,
            state.setEmailErrorsExist,
        ]);

    const [inputValue, setInputValue] = useState(subscribedEmail);

    const { data: adminPrefixes } = usePrefixAdministrators(
        prefix,
        minCapability
    );

    const { data: userInfo } = useUserInformationByPrefix(
        [prefix, ...adminPrefixes],
        minCapability
    );

    const inputErrorExists = useMemo(
        () => inputValue.length > 0 && !BASIC_EMAIL_RE.test(inputValue),
        [inputValue]
    );

    useEffect(() => {
        setEmailErrorsExist(inputErrorExists);
    }, [inputErrorExists, setEmailErrorsExist]);

    return (
        <FormControl fullWidth>
            <Autocomplete
                disabled={Boolean(serverError)}
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
                onChange={(_event, value, reason) => {
                    if (!value) {
                        setSubscribedEmail('');

                        return;
                    }

                    const creating = reason === 'createOption';

                    if (
                        creating &&
                        typeof value === 'string' &&
                        !BASIC_EMAIL_RE.test(value)
                    ) {
                        setInputValue('');
                    }

                    setSubscribedEmail(
                        typeof value === 'string'
                            ? sanitizeEmail(value)
                            : value.user_email
                    );
                }}
                onInputChange={(_event, value) => {
                    setInputValue(value);
                    setSubscribedEmail(sanitizeEmail(value));
                }}
                options={userInfo as Option[]}
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
                        <ListItem {...renderOptionProps} key={option.user_id}>
                            <UserAvatar
                                userName={option.user_full_name}
                                avatarUrl={option.user_avatar_url}
                                userEmail={option.user_email}
                            />

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
                                sx={{ ml: 2 }}
                            />
                        </ListItem>
                    );
                }}
                sx={{ flexGrow: 1 }}
                value={inputValue}
            />

            {inputErrorExists ? (
                <FormHelperText error={inputErrorExists}>
                    {intl.formatMessage({
                        id: 'alerts.config.dialog.emailSelector.inputError',
                    })}
                </FormHelperText>
            ) : null}
        </FormControl>
    );
}

export default EmailSelector;
