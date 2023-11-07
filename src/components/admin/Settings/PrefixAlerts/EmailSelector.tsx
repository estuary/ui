import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Chip,
    FormControl,
    FormHelperText,
    ListItem,
    TextField,
    Typography,
} from '@mui/material';
import useUserInformationByPrefix from 'hooks/useUserInformationByPrefix';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Grants_User } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    emails: string[];
    prefix: string;
    setEmails: Dispatch<SetStateAction<string[]>>;
    setSubscriptionsToCancel: Dispatch<SetStateAction<string[]>>;
    subscribedEmails: string[];
    subscriptionsToCancel: string[];
}

const simpleEmailRegEx = new RegExp(/.+@.+/m);

function EmailSelector({
    emails,
    prefix,
    setEmails,
    setSubscriptionsToCancel,
    subscribedEmails,
    subscriptionsToCancel,
}: Props) {
    const intl = useIntl();

    const [inputValue, setInputValue] = useState('');
    const [inputErrorExists, setInputErrorExists] = useState<boolean>(false);

    const { data } = useUserInformationByPrefix(prefix, 'admin');

    return (
        <FormControl fullWidth>
            <Autocomplete
                disabled={!prefix}
                disableCloseOnSelect
                filterSelectedOptions
                freeSolo
                getOptionLabel={(option) =>
                    typeof option !== 'string' ? option.user_email : option
                }
                handleHomeEndKeys
                inputValue={inputValue}
                multiple
                onChange={(_event, values, reason, details) => {
                    if (inputErrorExists) {
                        setInputErrorExists(false);
                    }

                    const newValue = values[values.length - 1];

                    if (reason === 'createOption') {
                        if (
                            typeof newValue === 'string' &&
                            !simpleEmailRegEx.test(newValue)
                        ) {
                            setInputErrorExists(true);
                            setInputValue(newValue);

                            return;
                        }

                        const updatedPendingCancellations =
                            subscriptionsToCancel.filter(
                                (email) => email !== newValue
                            );

                        setSubscriptionsToCancel(updatedPendingCancellations);
                    }

                    if (reason === 'selectOption' && details) {
                        const value =
                            typeof details.option !== 'string'
                                ? details.option.user_email
                                : details.option;

                        const updatedPendingCancellations =
                            subscriptionsToCancel.filter(
                                (email) => email !== value
                            );

                        setSubscriptionsToCancel(updatedPendingCancellations);
                    }

                    if (reason === 'removeOption' && details) {
                        const email =
                            typeof details.option !== 'string'
                                ? details.option.user_email
                                : details.option;

                        if (subscribedEmails.includes(email)) {
                            setSubscriptionsToCancel([
                                ...subscriptionsToCancel,
                                email,
                            ]);
                        }
                    }

                    if (reason === 'clear') {
                        setSubscriptionsToCancel(subscribedEmails);
                    }

                    const updatedEmails = values.map((value) =>
                        typeof value === 'string' ? value : value.user_email
                    );

                    setEmails(updatedEmails);
                }}
                onInputChange={(_event, value) => {
                    setInputValue(value);

                    if (inputErrorExists) {
                        setInputErrorExists(false);
                    }

                    if (value.includes(',') || value.endsWith(',')) {
                        const enteredEmails = value
                            .split(',')
                            .map((email) => email.trim())
                            .filter((email) => hasLength(email));

                        const formatErrorExists = enteredEmails.some(
                            (email) => !simpleEmailRegEx.test(email)
                        );

                        if (formatErrorExists) {
                            setInputErrorExists(true);

                            return;
                        }

                        const updatedEmails = [...emails, ...enteredEmails];

                        setEmails(updatedEmails);
                        setInputValue('');

                        const updatedPendingCancellations =
                            subscriptionsToCancel.filter(
                                (email) => !updatedEmails.includes(email)
                            );

                        setSubscriptionsToCancel(updatedPendingCancellations);
                    }
                }}
                options={
                    data.filter(
                        ({ user_email }) => !emails.includes(user_email)
                    ) as (Grants_User | string)[]
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
                            {option.user_full_name ? (
                                <Typography>{option.user_full_name}</Typography>
                            ) : null}

                            {option.user_email ? (
                                <Typography>{option.user_email}</Typography>
                            ) : null}
                        </ListItem>
                    );
                }}
                renderTags={(values, getTagProps) => {
                    return values.map((value, index) => {
                        const tagProps = getTagProps({ index });

                        return (
                            <Chip
                                {...tagProps}
                                key={`email-tag-${index}`}
                                label={value}
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
                    <FormattedMessage id="admin.alerts.dialog.emailSelector.error" />
                </FormHelperText>
            ) : null}
        </FormControl>
    );
}

export default EmailSelector;
