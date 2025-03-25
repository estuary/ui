import type { ButtonProps } from '@mui/material';
import type { MouseEventHandler } from 'react';
import { Button, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
    clickHandler: MouseEventHandler<HTMLButtonElement>;
    buttonVariant?: ButtonProps['variant'];
    disabled?: boolean;
    messageValues?: { [key: string]: any };
}

function MessageWithButton({
    messageId,
    clickHandler,
    buttonVariant = 'text',
    disabled,
    messageValues,
}: Props) {
    return (
        <Typography>
            <FormattedMessage
                id={messageId}
                values={{
                    button: (
                        <Button
                            variant={buttonVariant}
                            size="small"
                            disabled={disabled}
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
