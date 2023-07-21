import { FormattedMessage } from 'react-intl';

import { Box } from '@mui/material';

interface Props {
    messageID: string;
    // EmphasisComponent: any;
}

function MessageWithEmphasis({ messageID }: Props) {
    // const Wrapper = EmphasisComponent;

    return (
        <FormattedMessage
            id={messageID}
            tagName={Box}
            values={{
                emphasis: (
                    <b>
                        <FormattedMessage id={`${messageID}.emphasis`} />
                    </b>
                ),
            }}
        />
    );
}

export default MessageWithEmphasis;
