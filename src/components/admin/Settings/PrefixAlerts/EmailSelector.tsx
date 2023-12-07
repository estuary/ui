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
import UserAvatar from 'components/shared/UserAvatar';
import usePrefixAdministrators from 'hooks/usePrefixAdministrators';
import useUserInformationByPrefix from 'hooks/useUserInformationByPrefix';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Grant_UserExt } from 'types';
import { hasLength } from 'utils/misc-utils';

type Values = (Grant_UserExt | string)[];

interface Props {
    prefix: string;
    emailsByPrefix: EmailDictionary;
    setEmailsByPrefix: Dispatch<SetStateAction<EmailDictionary>>;
}

// Validation is VERY basic 'non-whitespace@non-whitespace'
const simpleEmailRegEx = new RegExp(/^\S+@\S+$/m);
const quoteRegEx = new RegExp(/['"]/g);

const minCapability = 'admin';

const stringHasCommas = (value: string) => value.includes(',');

// TODO (email cleansing)
// We are just removing all quotes right now because if a user enters
//      an email as "foo@foo.com" then there are issue with them deleting
//      that due to the quotes wrapping it
// This is an issue because technically an email can contain quotes within
//      the email. So we should support that eventually.
const cleanupEmail = (value: string) => {
    return value.replaceAll(quoteRegEx, '').trim();
};

const parseInputWithCommas = (value: string): string[] =>
    value
        .split(',')
        .map((email) => cleanupEmail(email))
        .filter((email) => hasLength(email));

const flattenValues = (values: Values, checkCommas: boolean): string[] => {
    return values.flatMap((value) =>
        typeof value === 'string'
            ? checkCommas && stringHasCommas(value)
                ? parseInputWithCommas(value)
                : cleanupEmail(value)
            : value.user_email
    );
};

function EmailSelector({ prefix, emailsByPrefix, setEmailsByPrefix }: Props) {
    const intl = useIntl();

    const [inputValue, setInputValue] = useState('');

    const { data: adminPrefixes } = usePrefixAdministrators(
        prefix,
        minCapability
    );

    const { data: userInfo } = useUserInformationByPrefix(
        [prefix, ...adminPrefixes],
        minCapability
    );

    const emails = useMemo(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        () => emailsByPrefix[prefix] ?? [],
        [prefix, emailsByPrefix]
    );

    const inputErrorExists = useMemo(
        () => emails.some((email) => !simpleEmailRegEx.test(email)),
        [emails]
    );

    const autoCompleteOptions = useMemo(
        () =>
            userInfo.filter(
                ({ user_email }) => !emails.includes(user_email)
            ) as Values,
        [emails, userInfo]
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
                    const creating = reason === 'createOption';

                    if (creating) {
                        const newValue = values[values.length - 1];
                        if (
                            typeof newValue === 'string' &&
                            !simpleEmailRegEx.test(newValue)
                        ) {
                            setInputValue('');
                        }
                    }

                    setEmailsByPrefix({
                        ...emailsByPrefix,
                        [prefix]: flattenValues(values, creating),
                    });
                }}
                onInputChange={(_event, value) => {
                    setInputValue(value);

                    if (stringHasCommas(value)) {
                        setEmailsByPrefix({
                            ...emailsByPrefix,
                            [prefix]: [
                                ...emails,
                                ...parseInputWithCommas(value),
                            ],
                        });

                        setInputValue('');
                    }
                }}
                options={autoCompleteOptions}
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
                                key={`email-tag-${email}-${index}`}
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
