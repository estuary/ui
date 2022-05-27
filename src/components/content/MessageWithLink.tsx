import { Box } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    messageID: string;
}

function MessageWithLink({ messageID }: Props) {
    const intl = useIntl();
    return (
        <FormattedMessage
            id={messageID}
            tagName={Box}
            values={{
                docLink: (
                    <ExternalLink
                        link={intl.formatMessage({
                            id: `${messageID}.docPath`,
                        })}
                    >
                        <FormattedMessage id={`${messageID}.docLink`} />
                    </ExternalLink>
                ),
            }}
        />
    );
}

export default MessageWithLink;
