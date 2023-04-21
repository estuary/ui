import { FormControl, FormLabel, TextField } from '@mui/material';
import { SetStateAction } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';

interface Props {
    nameInvalid: boolean;
    nameMissing: boolean;
    requestedTenant: string;
    setNameInvalid: React.Dispatch<SetStateAction<boolean>>;
    setNameMissing: React.Dispatch<SetStateAction<boolean>>;
    setRequestedTenant: React.Dispatch<SetStateAction<string>>;
}

function OrganizationNameField({
    nameInvalid,
    nameMissing,
    requestedTenant,
    setNameInvalid,
    setNameMissing,
    setRequestedTenant,
}: Props) {
    const intl = useIntl();

    const handlers = {
        update: (updatedValue: string) => {
            setRequestedTenant(updatedValue);

            if (nameMissing) setNameMissing(!hasLength(updatedValue));
        },
        validateOrganizationName: () => {
            const pattern = new RegExp(`^${PREFIX_NAME_PATTERN}$`);

            setNameInvalid(!pattern.test(requestedTenant));
        },
    };

    return (
        <FormControl>
            <FormLabel id="origin" required sx={{ mb: 1, fontSize: 16 }}>
                <FormattedMessage id="tenant.input.label" />
            </FormLabel>

            <TextField
                size="small"
                placeholder={intl.formatMessage({
                    id: 'tenant.input.placeholder',
                })}
                helperText={intl.formatMessage({
                    id:
                        nameMissing || nameInvalid
                            ? 'tenant.expectations.error'
                            : 'tenant.expectations',
                })}
                error={nameMissing || nameInvalid}
                id="requestedTenant"
                label={<FormattedMessage id="common.tenant.creationForm" />}
                value={requestedTenant}
                onChange={(event) => handlers.update(event.target.value)}
                onBlur={() => handlers.validateOrganizationName()}
                required
                inputProps={{
                    pattern: PREFIX_NAME_PATTERN,
                }}
                sx={{
                    'maxWidth': 424,
                    '& .MuiInputBase-root': { borderRadius: 3 },
                }}
            />
        </FormControl>
    );
}

export default OrganizationNameField;
