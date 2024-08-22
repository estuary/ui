import KeyValueList from 'components/shared/KeyValueList';
import { useIntl } from 'react-intl';

function ConnectorDetailsMissing() {
    const intl = useIntl();

    return (
        <KeyValueList
            data={[]}
            sectionTitle={intl.formatMessage({
                id: 'entityCreate.endpointConfig.connectorDetailsMissingTitle',
            })}
        />
    );
}

export default ConnectorDetailsMissing;
