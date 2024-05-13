import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
}

function ConfirmationAlert({ messageId }: Props) {
    return (
        <AlertBox severity="warning" short>
            <Typography component="div">
                <FormattedMessage id={messageId} />
            </Typography>
        </AlertBox>
    );
}

export default ConfirmationAlert;
