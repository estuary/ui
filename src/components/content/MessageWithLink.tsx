import { Box, SxProps } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
    messageID: string;
    link?: string;
    linkSx?: SxProps;
}

function MessageWithLink({ link, linkSx, messageID }: Props) {
    const intl = useIntl();
    return (
        <FormattedMessage
            id={messageID}
            tagName={Box}
            values={{
                docLink: (
                    <ExternalLink
                        link={
                            link ??
                            intl.formatMessage({
                                id: `${messageID}.docPath`,
                            })
                        }
                        sx={linkSx}
                    >
                        <FormattedMessage id={`${messageID}.docLink`} />
                    </ExternalLink>
                ),
            }}
        />
    );
}

export default MessageWithLink;
