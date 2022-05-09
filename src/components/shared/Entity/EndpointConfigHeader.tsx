import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage } from 'react-intl';

interface Props {
    docsPath?: string;
}

function EndpointConfigHeader({ docsPath }: Props) {
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
}

export default EndpointConfigHeader;
