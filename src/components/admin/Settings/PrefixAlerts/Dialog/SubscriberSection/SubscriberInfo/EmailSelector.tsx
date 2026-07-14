import type { AutocompleteRenderInputParams } from '@mui/material';
import type { SubscriptionDependentProps } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { Grant_UserExt } from 'src/types';

import { useEffect, useState } from 'react';

import {
    Autocomplete,
    FormControl,
    FormHelperText,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useEvaluateSubscriptionIneligibility } from 'src/components/admin/Settings/PrefixAlerts/useEvaluateSubscriptionIneligibility';
import UserAvatar from 'src/components/shared/UserAvatar';
import usePrefixAdministrators from 'src/hooks/usePrefixAdministrators';
import useUserInformationByPrefix from 'src/hooks/useUserInformationByPrefix';
import { BASIC_EMAIL_RE, isValidEmail } from 'src/validation';

type Option = Grant_UserExt | string;

const minCapability = 'admin';

const sanitizeEmail = (value: string) => {
    return value.trim();
};

// TODO: Investigate an issue that prevents the list of admin email from
//   being displayed as options. Confirm this is not an existing issue in
//   production.
function EmailSelector({
    subscription: { email: subscribedEmail, id: subscriptionId },
}: SubscriptionDependentProps) {
    const intl = useIntl();

    const serverError = useAlertSubscriptionsStore(
        (state) => state.initializationError
    );
    const [prefix, setSubscribedEmail, setEmailErrorsExist] =
        useAlertSubscriptionsStore(
            useShallow((state) => [
                state.catalogPrefix,
                state.setSubscribedEmail,
                state.setEmailErrorsExist,
            ])
        );
    const { emptyEmailDetected, duplicateSubscriptionEmails } =
        useEvaluateSubscriptionIneligibility();

    const [inputValue, setInputValue] = useState(subscribedEmail);

    const { data: adminPrefixes } = usePrefixAdministrators(
        prefix,
        minCapability
    );

    const { data: userInfo } = useUserInformationByPrefix(
        [prefix, ...adminPrefixes],
        minCapability
    );

    const inputErrorExists = !isValidEmail(inputValue);
    const inputErrorDisplayed = inputValue.length > 0 && inputErrorExists;

    const duplicateEmailDetected =
        duplicateSubscriptionEmails.includes(subscribedEmail);

    useEffect(() => {
        setEmailErrorsExist(
            inputErrorExists || duplicateEmailDetected,
            subscriptionId
        );
    }, [
        duplicateEmailDetected,
        inputErrorExists,
        setEmailErrorsExist,
        subscriptionId,
    ]);

    return (
        <FormControl fullWidth>
            <Autocomplete
                disabled={
                    Boolean(serverError) ||
                    (emptyEmailDetected && subscribedEmail.length > 0) ||
                    (duplicateSubscriptionEmails.length > 0 &&
                        !duplicateEmailDetected)
                }
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
                isOptionEqualToValue={(option, value) => {
                    if (typeof option === 'string') {
                        return typeof value === 'string'
                            ? value === option
                            : value.user_email === option;
                    }

                    return typeof value === 'string'
                        ? value === option.user_email
                        : value.user_email === option.user_email;
                }}
                onChange={(_event, value, reason) => {
                    if (!value) {
                        setSubscribedEmail('', subscriptionId);

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
                            : value.user_email,
                        subscriptionId
                    );
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === 'Tab') {
                        setSubscribedEmail(
                            sanitizeEmail(inputValue),
                            subscriptionId
                        );
                    }
                }}
                onInputChange={(_event, value) => {
                    setInputValue(value);
                }}
                options={userInfo as Option[]}
                renderInput={({
                    InputProps,
                    ...params
                }: AutocompleteRenderInputParams) => (
                    <TextField
                        {...params}
                        error={inputErrorDisplayed || duplicateEmailDetected}
                        label={intl.formatMessage({
                            id: 'data.email',
                        })}
                        onBlur={(_event) => {
                            setSubscribedEmail(
                                sanitizeEmail(inputValue),
                                subscriptionId
                            );
                        }}
                        required
                        size="small"
                        slotProps={{
                            input: {
                                sx: { borderRadius: 3 },
                            },
                        }}
                        variant="outlined"
                    />
                )}
                renderOption={(renderOptionProps, option) => {
                    return (
                        <ListItem
                            {...renderOptionProps}
                            key={
                                typeof option === 'string'
                                    ? option
                                    : option.user_id
                            }
                        >
                            {typeof option === 'string' ? (
                                <Typography>{option}</Typography>
                            ) : (
                                <>
                                    <UserAvatar
                                        userName={option.user_full_name}
                                        avatarUrl={option.user_avatar_url}
                                        userEmail={option.user_email}
                                    />

                                    <ListItemText
                                        primary={option.user_full_name}
                                        secondary={option.user_email}
                                        slotProps={{
                                            primary: {
                                                sx: {
                                                    fontWeight: 500,
                                                    fontSize: 16,
                                                },
                                            },
                                            secondary: {
                                                sx: {
                                                    color: (theme) =>
                                                        theme.palette.text
                                                            .primary,
                                                },
                                            },
                                        }}
                                        sx={{ ml: 2 }}
                                    />
                                </>
                            )}
                        </ListItem>
                    );
                }}
                sx={{ flexGrow: 1 }}
                value={inputValue}
            />

            {inputErrorDisplayed ? (
                <FormHelperText error>
                    {intl.formatMessage({
                        id: 'alerts.config.dialog.emailSelector.inputError',
                    })}
                </FormHelperText>
            ) : null}

            {duplicateEmailDetected ? (
                <FormHelperText error>
                    {intl.formatMessage({
                        id: 'alerts.config.dialog.emailSelector.duplicationError',
                    })}
                </FormHelperText>
            ) : null}
        </FormControl>
    );
}

export default EmailSelector;
