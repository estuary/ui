import type { MessageWithLinkProps } from 'src/components/content/types';

import { Box } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';

function MessageWithLink({
    link,
    linkOptions,
    intlValues = {},
    messageID,
}: MessageWithLinkProps) {
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
                ...intlValues,
            }}
        />
    );
}

export default MessageWithLink;
