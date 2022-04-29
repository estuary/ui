import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage } from 'react-intl';

interface Props {
    path?: string;
    messageId: string;
}

function Link({ path, messageId }: Props) {
    if (path && path.length > 0) {
        return (
            <ExternalLink link={path}>
                <FormattedMessage id={messageId} />
            </ExternalLink>
        );
    } else {
        return <FormattedMessage id="common.missing" />;
    }
}

export default Link;
