import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Chip,
    ListItem,
    TextField,
    Typography,
} from '@mui/material';
import useUserInformationByPrefix from 'hooks/useUserInformationByPrefix';
import { Dispatch, SetStateAction, useState } from 'react';
import { useIntl } from 'react-intl';
import { Grants_User } from 'types';

interface Props {
    emails: string[];
    prefix: string;
    setEmails: Dispatch<SetStateAction<string[]>>;
}

const simpleEmailRegEx = new RegExp(/.+@.+/m);

function EmailSelector({ emails, prefix, setEmails }: Props) {
    const intl = useIntl();

    const [inputValue, setInputValue] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);

    const { data, isValidating } = useUserInformationByPrefix(prefix, 'admin');

    console.log('prefix', prefix);
    console.log('validating', isValidating);

    return (
        <Autocomplete
            disableCloseOnSelect
            filterSelectedOptions
            freeSolo
            getOptionLabel={(option) =>
                typeof option !== 'string' ? option.user_email : option
            }
            inputValue={inputValue}
            multiple
            onChange={(_event, values, reason) => {
                if (inputError) {
                    setInputError(null);
                }

                const newValue = values[values.length - 1];

                if (
                    reason === 'createOption' &&
                    typeof newValue === 'string' &&
                    !simpleEmailRegEx.test(newValue)
                ) {
                    setInputError('Email is not formatted properly.');
                    setInputValue(newValue);

                    return;
                }

                const updatedEmails = values.map((value) =>
                    typeof value === 'string' ? value : value.user_email
                );

                setEmails(updatedEmails);
            }}
            onInputChange={(_event, value) => {
                setInputValue(value);

                if (inputError) {
                    setInputError(null);
                }

                if (value.endsWith(',')) {
                    if (!simpleEmailRegEx.test(value)) {
                        setInputError('Email is not formatted properly.');

                        return;
                    }

                    const updatedEmails = [
                        ...emails,
                        value.substring(0, value.length - 1),
                    ];

                    setEmails(updatedEmails);
                    setInputValue('');
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
                    error={inputError !== null}
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
    );
}

export default EmailSelector;
