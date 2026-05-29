import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

interface Props {
    messageID: string;
    emphasisContent?: Record<string, any>;
}

function MessageWithEmphasis({ emphasisContent, messageID }: Props) {
    const intl = useIntl();

    return (
        <Box id={messageID}>
            {intl.formatMessage(
                { id: messageID },
                emphasisContent
                    ? emphasisContent
                    : {
                          emphasis: (
                              <b>
                                  {intl.formatMessage({
                                      id: `${messageID}.emphasis`,
                                  })}
                              </b>
                          ),
                      }
            )}
        </Box>
    );
}

export default MessageWithEmphasis;
