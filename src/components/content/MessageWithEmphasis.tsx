import { Box } from '@mui/material';

import { FormattedMessage } from 'react-intl';

interface Props {
    messageID: string;
    emphasisContent?: Record<string, any>;
}

function MessageWithEmphasis({ emphasisContent, messageID }: Props) {
    return (
        <FormattedMessage
            id={messageID}
            tagName={Box}
            values={
                emphasisContent ?? {
                    emphasis: (
                        <b>
                            <FormattedMessage id={`${messageID}.emphasis`} />
                        </b>
                    ),
                }
            }
        />
    );
}

export default MessageWithEmphasis;
