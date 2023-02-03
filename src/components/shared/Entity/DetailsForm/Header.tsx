import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useDetailsForm_errorsExist } from 'stores/DetailsForm';

interface Props {
    messagePrefix: string;
}

function DetailsFormHeader({ messagePrefix }: Props) {
    const detailsFormHasErrors = useDetailsForm_errorsExist();

    return (
        <>
            {detailsFormHasErrors ? (
                <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />
            ) : null}

            <Typography variant="subtitle1">
                <FormattedMessage id={`${messagePrefix}.details.heading`} />
            </Typography>
        </>
    );
}

export default DetailsFormHeader;
