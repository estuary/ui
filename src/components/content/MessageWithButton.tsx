import { Box, Button, ButtonProps, Typography } from '@mui/material';
import { MouseEventHandler } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    clickHandler: MouseEventHandler<HTMLButtonElement>;
    buttonVariant?: ButtonProps['variant'];
}

function MessageWithButton({
    messageId,
    clickHandler,
    buttonVariant = 'text',
}: Props) {
    return (
        <Typography component="div" sx={{ lineHeight: 1 }}>
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
                }}
            />
        </Typography>
    );
}

export default MessageWithButton;
