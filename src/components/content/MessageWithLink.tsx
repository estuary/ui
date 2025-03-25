import { Box } from '@mui/material';
import type { ExternalLinkOptions } from 'components/shared/ExternalLink';
import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    messageID: string;
    link?: string;
    linkOptions?: ExternalLinkOptions;
}

function MessageWithLink({ link, linkOptions, messageID }: Props) {
    const intl = useIntl();
    return (
        <FormattedMessage
            id={messageID}
            tagName={Box}
            values={{
                docLink: (
                    <ExternalLink
                        {...linkOptions}
                        link={
                            link ??
                            intl.formatMessage({
                                id: `${messageID}.docPath`,
                            })
                        }
                    >
                        <FormattedMessage id={`${messageID}.docLink`} />
                    </ExternalLink>
                ),
            }}
        />
    );
}

export default MessageWithLink;
