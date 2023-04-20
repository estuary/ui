import { Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';

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
