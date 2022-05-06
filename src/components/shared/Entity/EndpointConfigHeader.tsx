import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage } from 'react-intl';

interface Props {
    name: string;
    docsPath?: string;
}

function EndpointConfigHeader({ name, docsPath }: Props) {
    if (name) {
        return (
            <>
                <FormattedMessage id="foo.endpointConfig.heading" />
                {docsPath && docsPath.length > 0 ? (
                    <ExternalLink link={docsPath}>
                        <FormattedMessage id="foo.ctas.docs" />
                    </ExternalLink>
                ) : null}
            </>
        );
    } else {
        return null;
    }
}

export default EndpointConfigHeader;
