import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string | null;
}

function DeleteConfirmation({ messageId }: Props) {
    return (
        <AlertBox severity="warning" short>
            <Typography component="div" sx={{ mb: messageId ? 1 : undefined }}>
                <FormattedMessage id="entityTable.delete.confirm" />
            </Typography>

            {messageId ? (
                <Typography component="div">
                    <FormattedMessage id={messageId} />
                </Typography>
            ) : null}
        </AlertBox>
    );
}

export default DeleteConfirmation;
