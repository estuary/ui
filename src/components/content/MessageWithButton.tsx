import { Box, Button, ButtonProps, Typography } from '@mui/material';
import { MouseEventHandler } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    clickHandler: MouseEventHandler<HTMLButtonElement>;
    buttonVariant?: ButtonProps['variant'];
    messageValues?: { [key: string]: any };
}

function MessageWithButton({
    messageId,
    clickHandler,
    buttonVariant = 'text',
    messageValues,
}: Props) {
    return (
        <Typography component="div">
            <FormattedMessage
                id={messageId}
                tagName={Box}
                values={{
                    button: (
                        <Button
                            variant={buttonVariant}
                            size="small"
                            onClick={clickHandler}
                        >
                            <FormattedMessage id={`${messageId}.button`} />
                        </Button>
                    ),
                    ...messageValues,
                }}
            />
        </Typography>
    );
}

export default MessageWithButton;
