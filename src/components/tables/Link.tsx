import { useIntl } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';

interface Props {
    path?: string;
    message: string;
}

export function Link({ path, message }: Props) {
    if (path && path.length > 0) {
        return <ExternalLink link={path}>{message}</ExternalLink>;
    }

    return <>N/A</>;
}

/** @deprecated Prefer the named `Link` export */
function LinkWrapper({
    messageId,
    ...props
}: Omit<Props, 'message'> & { messageId: string }) {
    const intl = useIntl();

    return <Link {...props} message={intl.formatMessage({ id: messageId })} />;
}

export default LinkWrapper;
