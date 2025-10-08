import type { ExternalLinkOptions } from 'src/components/shared/ExternalLink';

import { Box } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';

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
                        {intl.formatMessage({
                            id: `${messageID}.docLink`,
                        })}
                    </ExternalLink>
                ),
            }}
        />
    );
}

export default MessageWithLink;
